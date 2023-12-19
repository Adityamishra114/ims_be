import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MaterialsInterface } from './interface/materials.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MaterialsService {
    constructor(@Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @InjectModel('Materials') private readonly materialsModel: Model<MaterialsInterface>){}


    async changeStoreName(storeName, updatedName){
        try {
            await this.materialsModel.updateMany(
                {storeName},
                {storeName: updatedName}
        )
  
        return 'Materials have been updated'
        } catch (error) {
            throw error
        }
    }

    async findName(name, quantity, storeName){
        try {
            const material = await this.materialsModel.findOne({
                name,
                quantity: {$gte: quantity},
                storeName
            })
            if (!material) throw new HttpException('Material not found', HttpStatus.NOT_FOUND)
            return material
        } catch (error) {
            throw error
        }
    }

    async assignMaterials(name, newQuantity, storeName){
        try {
            await this.materialsModel.findOneAndUpdate({
                name,
                storeName
            },{
                $set: {quantity: newQuantity}
            }, {new:true})
            
            return 
        } catch (error) {
            throw error
        }
    }

    async create(req, createMaterialsDto){
        try {
            // if logged in user is not of the same store
            if (req.user.role !== "admin" && req.user.storeName !== createMaterialsDto.storeName) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)

            // if exists
            const materialExists = await this.materialsModel.findOne({name: createMaterialsDto.name})
            if (materialExists?.storeName === createMaterialsDto.storeName) throw new HttpException('Raw material already exists', HttpStatus.CONFLICT)

            createMaterialsDto.createdBy = req.user.username
            createMaterialsDto.createdById = req.user._id
            createMaterialsDto.createdByRole = req.user.role
            const material = new this.materialsModel(createMaterialsDto)
            await material.save()
            return 
        } catch (error) {
            throw error
        }
    }

    async add(req, name, quantity, storeName){
        try {
            if (req.user.role === "admin" && !storeName) throw new HttpException('Store name is required', HttpStatus.BAD_REQUEST)
            let query = {name}
            if (req.user.role === "subadmin"){
                query["storeName"] = req.user.storeName
            }else{
                query["storeName"] = storeName
            }
            const material = await this.materialsModel.findOne(query)
            if (!material) throw new HttpException('Material not found', HttpStatus.BAD_REQUEST)

            material.quantity += +quantity
            if (material.quantity < 0) throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
            
            material.updatedBy = req.user.username
            material.updatedById = req.user._id
            material.updatedByRole = req.user.role
            material.updatedAt = new Date()
            
            await material.save()
            return 
            
        } catch (error) {
            throw error
        }
    }

    async findAll(req, filter){
        try {

            let query = {}
            if (filter){
                query[filter.key] = filter.value
            }

            if (req.user.role === 'subadmin'){
                query["storeName"] = req.user.storeName
            }
            const materials = await this.materialsModel.find(query).sort({createdAt: -1})
            return materials
        } catch (error) {
            throw error
        }
    }

    async findOne(req, id){
        try {
            let query = {_id: id}
            if (req.user.role === 'subadmin'){
                query["storeName"] = req.user.storeName
            }
            const material = await this.materialsModel.findOne(query)
            if (!material) throw new HttpException('Raw material not found', HttpStatus.NOT_FOUND)
            return material
        } catch (error) {
            throw error
        }
    }

    async update(req, id, updateMaterialsDto){
        try {
            let query = {_id: id}
            if (req.user.role === 'subadmin'){
                query["storeName"] = req.user.storeName
            }
            const material = await this.materialsModel.findOne(query)
            if (!material) throw new HttpException('Raw material not found', HttpStatus.NOT_FOUND)

            // if quantity
            updateMaterialsDto.quantity = +material.quantity + +updateMaterialsDto.quantity
            if (updateMaterialsDto.quantity < 0) throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)

            updateMaterialsDto.updatedBy = req.user.username
            updateMaterialsDto.updatedById = req.user._id
            updateMaterialsDto.updatedByRole = req.user.role
            updateMaterialsDto.updatedAt = new Date()
            await this.materialsModel.findByIdAndUpdate(id, updateMaterialsDto, {new: true})
            return 
        } catch (error) {
            throw error
        }
    }

    async allMaterials(req, id){
        try {
            const engineer = await this.userService.findOne(req, id)
            let query = {
                storeName: engineer.storeName
            }
           const materials = await this.materialsModel.find(query,{name:1, unit:1, quantity:1, _id:0})
           return materials 
        } catch (error) {
            throw error
        }
    }

    async allmaterials(req){
        try {
            const user = await this.userService.findOneAuth(req.user._id.toString())
            let query = {}
            if (req.user.role !== "admin"){
                query["storeName"] = user.storeName
            }
           const materials = await this.materialsModel.find(query,{name:1, unit:1, _id:0})
           return materials 
        } catch (error) {
            throw error
        }
    }
}
