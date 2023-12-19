import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StagesInterface } from './interface/stages.interface';

@Injectable()
export class StagesService {

    constructor(@InjectModel('Stages') private readonly stagesModel : Model<StagesInterface>){}

    // get stage by given storeName
    async findName(storeName){
        try {
            let stage = await this.stagesModel.findOne(
                {storeName}
            )
            return stage
        } catch (error) {
            throw error
        }
    }

    // create 
    async create(storeName){
        try {
            const status = ['ordered', 'received', 'new', 'inProgress', 'pending', 'error', 'completed', 'soldOut']
            let stages = []
            for (let i = 0; i < status.length; i++) {
                let obj = {
                    name: status[i],
                    value: '0'
                }
                stages.push({...obj})
            }
            let stageObj = {
                storeName,
                stages
            }
            let stage = new this.stagesModel(stageObj)
            await stage.save()
            return stage
        } catch (error) {
            throw error
        }
    }

    // add products to given stage
    async addProducts(storeName, name, number){
        try {
            let stage = await this.findName(storeName)

            // if not found, create one
            if (!stage){
                stage = await this.create(storeName)
            }

            // add products
            for (let i = 0; i < stage.stages.length; i++) {
                const status = stage.stages[i];
                if (status.name === name){
                    status.value = `${+status.value + number}`
                    await stage.save()
                    break
                }               
            }
            return stage

        } catch (error) {
            throw error
        }
    }

    // remove products from given stage
    async removeProducts(storeName, name, number){
        try {
            let stage = await this.findName(storeName)

            // if not found, create one
            if (!stage){
                stage = await this.create(storeName)
            }

            // remove products
            for (let i = 0; i < stage.stages.length; i++) {
                const status = stage.stages[i];
                if (status.name === name){
                    status.value = `${+status.value - number}`
                    if (+status.value < 0) status.value = '0'
                    await stage.save()
                    break
                }               
            }
            return stage

        } catch (error) {
            throw error
        }
    } 
    
    // used in dashboard
    async dashboard(req, storeName){
        try {
            // get stage
            let stage = await this.findName(storeName)
            if (!stage) {
                stage = await this.create(storeName)
            }

            // rearrage
            let stages = []
            let products = []
            for (let i = 0; i < stage.stages.length; i++) {
                const status = stage.stages[i];
                stages.push(status.name)
                products.push(status.value)
            }
            let stagesUpdated = {
                stages,
                products
            }
            return stagesUpdated

        } catch (error) {
            throw error
        }
    }
  


}
