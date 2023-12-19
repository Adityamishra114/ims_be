import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EngineerHistoryInterface } from './interface/engineerHistory.interface';
import { MaterialsService } from 'src/materials/materials.service';
import { UserService } from 'src/user/user.service';
import { StoreService } from 'src/store/store.service';
import { LoginDto } from 'src/auth/dto/create-auth.dto';
import { Console } from 'console';

@Injectable()
export class EngineerHistoryService {
  constructor(@Inject(forwardRef(() => MaterialsService))private readonly materialsService: MaterialsService,
  @Inject(forwardRef(() => UserService))private readonly userService: UserService,
  @Inject(forwardRef(() => StoreService))private readonly storeService: StoreService,
  @InjectModel('EngineerHistory') private readonly engineerHistoryModel: Model<EngineerHistoryInterface>,
  ){}


  async getMonthYear(date){
    try {
      const dateString = new Date(date).toISOString().split('T')[0].split('-')
      const time = dateString.slice(0,2).join('/')
      return time
    } catch (error) {
      throw error
    }
  }

  async getRemoveMonthYear(date){
    try {
      const removeDate = new Date(new Date(date).setMonth(new Date(date).getMonth() - 6))
      const removeTime = await this.getMonthYear(removeDate)
      return removeTime
    } catch (error) {
      throw error
    }
  }

  async materialsAvailable(extraMaterials, material){
    try {
      const materialAvailable = extraMaterials.find(obj => obj.name === material.name)
      return materialAvailable
    } catch (error) {
      throw error
    }
  }

  // used in product
  async assignedProduct(id, engineerObj){
    try {
      const history = await this.engineerHistoryModel.findOne({_id:id})
      if (history.workingHistory.length === 0){
        throw new HttpException('Assign raw materials', HttpStatus.BAD_REQUEST)
      }
      let activeHistory = history.workingHistory.find(obj => obj.date === engineerObj.time)
      if (!activeHistory){
        const newObj = {
          materialsAssigned: [],
          materialsUsed: [],
          materialsAvailable: history.workingHistory[history.workingHistory.length - 1].materialsAvailable,
          totalProducts: 1,
          successProducts: 0,
          failedProducts: 0,
          date: engineerObj.time,
          products: [engineerObj]
        }
        history.workingHistory.push(newObj)
        // remove from history if more than 6 entries
        if (history.workingHistory.length > 6){
          history.workingHistory = history.workingHistory.slice(0,-1)
        }
      }else{
        activeHistory.totalProducts += 1
        activeHistory.products.push(engineerObj)
      }
      // console.log(history.workingHistory)
      await history.save()
      return
      
    } catch (error) {
      throw error
    }
  }

  // used in product
  async closeProduct(id, productId, lastObj, date, materials){
    try {
      const history = await this.engineerHistoryModel.findOne({_id:id})

      if (history.workingHistory.length === 0){
        throw new HttpException('Assign raw materials', HttpStatus.BAD_REQUEST)
      }

      //  find month object when product was assigned
      let productObj = history.workingHistory.find(obj => obj.date === date)
      if (!productObj) throw new HttpException('Product not found',HttpStatus.NOT_FOUND)
      
      // make changes in product
      let product = productObj.products.find(obj => obj.productId.toString() === productId)
      if (!product) throw new HttpException('Product not found', HttpStatus.BAD_REQUEST)
      for(let key in lastObj){
        product[key] = lastObj[key]
      }
      
      // get today's date
      const todayDate = (new Date()).getTime() + (5*60*60*1000 + 30*60*1000)
      const time = await this.getMonthYear(todayDate)
      // const time = "2023/11"
      
      let currentObj 
      // if product assigned month is not same as current month
      if (time !== date){
       
        // find current month object
        let newObj = history.workingHistory.find(obj => obj.date === time)

        // if not found - create one
        if (!newObj){
          newObj = {
            materialsAssigned: [],
            materialsUsed: [],
            materialsAvailable: history.workingHistory[history.workingHistory.length - 1].materialsAvailable,
            totalProducts: 0,
            successProducts: 0,
            failedProducts: 0,
            date: time,
            products: []
          }
          history.workingHistory.push(newObj)
          // remove from history if more than 6 entries
          if (history.workingHistory.length > 6){
            history.workingHistory = history.workingHistory.slice(0,-1)
          }
        }
        currentObj = newObj
        currentObj.totalProducts += 1
        currentObj.products = [...currentObj.products, product]
        productObj.totalProducts -= 1 
        productObj.products = productObj.products.filter(obj => obj.productId.toString() !== productId)
      }else{
        currentObj = productObj
      }

      // if has enough materials, make changes in used and available materials
      const materialsAvailable = currentObj.materialsAvailable
      const materialsUsed = currentObj.materialsUsed
      for (let i = 0; i < materials.length; i++) {
        const materialUsed = materials[i]
        const materialExists = await this.materialsAvailable(materialsAvailable, materialUsed)
        if (!materialExists || +materialExists.quantity < +materialUsed.quantity){
          throw new HttpException('Material is not available', HttpStatus.BAD_REQUEST)
        }
        materialExists.quantity = `${+materialExists.quantity - +materialUsed.quantity}`
        const materialUsedExists = await this.materialsAvailable(materialsUsed, materialUsed)
        if (materialUsedExists){
          materialUsedExists.quantity = `${+materialUsedExists.quantity + +materialUsed.quantity}`
        }else{
          currentObj.materialsUsed.push(materialUsed)
        }
        product.materialsUsed.push(materialUsed)
      }

      // make changes in success or faileed products
      if (product.status === "success"){
        currentObj.successProducts += 1
      }else{
        currentObj.failedProducts += 1
      }     

      await history.save()

    } catch (error) {
      throw error
    }
  }

  // used in user
  async findOne(id, date){
    try {
      const history = await this.engineerHistoryModel.findOne({
        _id: id
      })
      if (!history) throw new HttpException('History not found', HttpStatus.NOT_FOUND)

      let workingHistory
      if (date){
        workingHistory = history.workingHistory.find(obj => obj.date === date)
      }else{
        workingHistory = history.workingHistory[history.workingHistory.length - 1]        
      }

      return workingHistory
    } catch (error) {
      throw error
    }
  }

  async materialUsed(id, date, productId){
    try {
      const history = await this.engineerHistoryModel.findOne({
        _id: id
      })
      if (!history) throw new HttpException('History not found', HttpStatus.NOT_FOUND)

      let workingHistory
      if (date){
        workingHistory = history.workingHistory.find(obj => obj.date === date)
      }else{
        workingHistory = history.workingHistory[history.workingHistory.length - 1]        
      }

      const productExists = workingHistory.products.find(obj => obj.productId == productId)
      let materialsUsed = []
      if (productExists){
        materialsUsed = productExists.materialsUsed
      }

      return materialsUsed
    } catch (error) {
      throw error
    }
  }

  async create(){
    try {
        const obj = {}
        const newHistory = new this.engineerHistoryModel(obj)
        await newHistory.save()
        return newHistory._id

    } catch (error) {
        throw error
    }
  }

  async materialsData(req, engId){
    try{

      const rawMaterials = await this.materialsService.allMaterials(req, engId)

      const materialsAsked = await this.userService.materials(engId)

      const engineer = await this.userService.findOne(req, engId)
      const engineerHistory = await this.engineerHistoryModel.findOne({
        _id: engineer.workingHistory
      })
      let materialsAvailable = []
      if (engineerHistory.workingHistory.length > 0){
        const lastObj = engineerHistory.workingHistory[engineerHistory.workingHistory.length - 1]
        materialsAvailable = lastObj.materialsAvailable
      }

      return {rawMaterials, materialsAsked, materialsAvailable}

    } catch (error) {
      throw error
    }
  }
  
  async materialsDataAsking(req){
    try{     

      const materialsAsked = req.user.materialsAsked

      const engineerHistory = await this.engineerHistoryModel.findOne({
        _id: req.user.workingHistory
      })
      let materialsAvailable = []
      if (engineerHistory.workingHistory.length > 0){
        const lastObj = engineerHistory.workingHistory[engineerHistory.workingHistory.length - 1]
        materialsAvailable = lastObj.materialsAvailable
      }

      return {materialsAsked, materialsAvailable}

    } catch (error) {
      throw error
    }
  }

  async assignMaterials(req, assignMaterialsDto){
    try {
      let {materials, engineerId} = assignMaterialsDto

      // find engineer, storeName
      const engineer = await this.userService.findOne(req, engineerId)
      const storeName = engineer.storeName

      // go through all the raw materials with storeName obtained and materials passed 
      for (let ind = 0; ind < materials.length; ind++){
        const obj = materials[ind]
        await this.materialsService.findName(obj.name, obj.quantity, storeName)
      }
      
      // generate date
      const todayDate = (new Date()).getTime() + (5*60*60*1000 + 30*60*1000)
      const time = await this.getMonthYear(todayDate)
      // const time = "2023/11"
      
      //  get history
      const history = await this.engineerHistoryModel.findOne({
        _id: engineer.workingHistory
      })

      // find object from workingHistory of engineer
      const exists = history.workingHistory.length > 0 && (history.workingHistory[history.workingHistory.length - 1]).date === time
      
      // if found - make changes in materials assigned, materials available      
      // else - 
      // find last month available
      // add and make materials assigned
      // clone to materials available
      // empty object - materials used

      let obj 
      if (exists){
        obj = history.workingHistory[history.workingHistory.length - 1]
        for (let i = 0; i < materials.length; i++) {
          const material = materials[i]
          const materialAssigned = await this.materialsAvailable(obj.materialsAssigned, material)
          const materialAvailable = await this.materialsAvailable(obj.materialsAvailable, material)
          if (materialAssigned){
            materialAssigned.quantity = `${+materialAssigned.quantity + +material.quantity}`
          }else{
            obj.materialsAssigned.push(material)
          }          
          if (materialAvailable){
            materialAvailable.quantity = `${+materialAvailable.quantity + +material.quantity}`
          }
          else{
            obj.materialsAvailable.push(material)
          }
        };
        obj.updatedBy = req.user.username
        obj.updatedById = req.user._id
        obj.updatedByRole = req.user.role
        obj.updatedAt = new Date()
      }else{
        obj = {}
        let extraMaterials = []
        if (history.workingHistory.length > 0){
          extraMaterials = history.workingHistory[history.workingHistory.length - 1].materialsAvailable
        }
        for (let i = 0; i < materials.length; i++) {
          const material = materials[i]
          const materialAvailable = await this.materialsAvailable(extraMaterials, material)
          if (materialAvailable){
            material.quantity = `${+material.quantity + +materialAvailable.quantity}`
            extraMaterials = extraMaterials.filter(obj => obj.name !== materialAvailable.name)
          }
        }
        if (extraMaterials.length > 0){
          materials = [...materials, ...extraMaterials]
        }
        obj["materialsAssigned"] = materials
        obj["materialsAvailable"] = materials
        obj["materialsUsed"] = []
        obj["date"] = time
        obj["updatedBy"] = req.user.username
        obj["updatedById"] = req.user._id
        obj["updatedByRole"] = req.user.role
        obj["updatedAt"] = new Date()
        history.workingHistory.push(obj)
      }

      // remove from history if more than 6 entries
      if (history.workingHistory.length > 6){
        history.workingHistory = history.workingHistory.slice(0,-1)
      }
      
      // save history
      await history.save()

      // make changes in materials asked in engineer
      if (engineer.asking){
        for (let i = 0; i < engineer.materialsAsked.length; i++) {
          const material = engineer.materialsAsked[i]
          const materialExists = await this.materialsAvailable(materials, material)
          if (materialExists){
            const remainingQnt = +materialExists.quantity - +material.quantity
            if (remainingQnt < 0){
              material.quantity = `${+material.quantity - +materialExists.quantity}`
            }else{
              engineer.materialsAsked = engineer.materialsAsked.filter(obj => obj.name !== material.name)
            }
          }          
        }
        if (engineer.materialsAsked.length == 0){
          engineer.asking = false
        }
      }

      //  save changes in engineer
      await engineer.save()
      
      // go through all the raw materials with storeName obtained and materials passed and make changes in quantity
      for (let i = 0; i < materials.length; i++) {
        const material = materials[i]
        const storeMaterial = await this.materialsService.findName(material.name, material.quantity, engineer.storeName)
        const newQuantity = storeMaterial.quantity - +material.quantity
        await this.materialsService.assignMaterials(material.name, +newQuantity, engineer.storeName)
      }

      return

    } catch (error) {
      throw error
    }
  }

  async askMaterials(req, askMaterialsDto){
    try {
      let {materials} = askMaterialsDto

      // find engineer
      const engineer = req.user

      if (engineer.asking){
        for (let i = 0; i < engineer.materialsAsked.length; i++) {
          const material = engineer.materialsAsked[i]
          const alreadyAsked = await this.materialsAvailable(materials, material)
          if (alreadyAsked){
            material.quantity = `${+material.quantity + +alreadyAsked.quantity}`
            materials = materials.filter(obj => obj.name !== alreadyAsked.name)
          }
        }
      }
      engineer.materialsAsked = [...engineer.materialsAsked, ...materials]
      engineer.asking = true

      await engineer.save()
      return

    } catch (error) {
      throw error
    }
  }

}
