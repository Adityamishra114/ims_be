import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ManufacturerInterface } from './interface/manufacturer.interface';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class ManufacturerService {

  constructor(@InjectModel('Manufacturer') private readonly manufacturerModel: Model<ManufacturerInterface>){}

  // used in dashboard
  async dashboard(type){
    try {
      
      // get manufacturers 
      const allManufacturers = await this.manufacturerModel.find()

      // if type is not defined, default pass value
      if (!type) type = "value"

      // rearrage
      let manufacturers = []
      let products = []
      for (let i = 0; i < allManufacturers.length; i++) {
          const manufacturer = allManufacturers[i];
          manufacturers.push(manufacturer.name)
          if (type === 'number'){
            products.push(manufacturer.totalPurchase)
          }else {
            products.push(manufacturer.totalPurchaseVal)
          }
      }
      
      let manufacturersUpdated = {
          manufacturers,
          products
      }
      return manufacturersUpdated
    } catch (error) {
      throw error
    }
  }

  // used in store
  async changeStoreName(storeName, newStoreName){
    try {
      await this.manufacturerModel.updateMany(
        {purchaseHistory: {$elemMatch: {storeName}}},
        {$set: {'purchaseHistory.$.storeName': newStoreName}},
        {new: true}
      )
      return
    } catch (error) {
      throw error
    }
  }

  // used in purchase order
  async addInHistory(purchaseOrder, ids){
    try {
      // console.log(purchaseOrder)
      const {manufacturerId} = purchaseOrder

      const manufacturer = await this.manufacturerModel.findOne({_id:manufacturerId})
      // console.log(manufacturer)

      // purchaseHistory
      let purchaseHistory = {
        purchaseOrderNo: purchaseOrder.purchaseOrderNo,
        purchaseOrderId: purchaseOrder._id,
        totalItems: purchaseOrder.totalItems,
        subTotal: purchaseOrder.subTotal,
        extraDiscount: purchaseOrder.extraDiscount,
        orderTotal: purchaseOrder.orderTotal,
        storeName: purchaseOrder.storeName,
        boughtBy: purchaseOrder.boughtBy,
        boughtById: purchaseOrder.boughtById,
        boughtByRole: purchaseOrder.boughtByRole,
        boughtAt: new Date(),
        products: []
      } 

      // iterate through products for productId
      for (let i = 0; i < purchaseOrder.products.length; i++) {
        const product = purchaseOrder.products[i];
        // product["productId"] = ids[i]
        purchaseHistory.products.push({...product._doc, productId: ids[i]})
      }
      
      // add purchaseHistory
      manufacturer.purchaseHistory.push(purchaseHistory)

      // total purchase and total purchase value
      manufacturer.totalPurchase += purchaseHistory.totalItems
      manufacturer.totalPurchaseVal += purchaseHistory.orderTotal
      // console.log(manufacturer)

      await manufacturer.save()
      return
    } catch (error) {
      throw error
    }
  }

  // used in product
  async findOne(id) {
    try {
      const manufacturer = await this.manufacturerModel.findOne({_id:id})
      if (!manufacturer) throw new HttpException('Manufacturer not found', HttpStatus.BAD_REQUEST)
      return manufacturer
    } catch (error) {
      throw error
    }
  }

  // email exists
  async manufacturerExists(email){
    try {
      const manufacturer = await this.manufacturerModel.findOne({email})
      if (manufacturer) throw new HttpException('Manufacturer email exists already', HttpStatus.CONFLICT)
      return
    } catch (error) {
      throw error
    }
  }

  async create(req, createManufacturerDto) {
    try { 
      await this.manufacturerExists(createManufacturerDto.email)

      console.log('hey')
      createManufacturerDto.createdBy = req.user.username
      createManufacturerDto.createdById = req.user._id
      createManufacturerDto.createdByRole = req.user.role

      const newManufacturer = new this.manufacturerModel(createManufacturerDto)
      await newManufacturer.save()
      return newManufacturer
      
    } catch (error) {
      throw error
    }
  }

  // get all manufacturers
  async findAll(req, allManufacturersDto, page, limit){
    try {
      let {filters, apply} = allManufacturersDto
      if (filters.length === 0 && apply !== '') {
        apply = 'all'
      }

      let query 
      if (apply === "" || apply === "all"){
        query = {}
        if (req.user.role === "subadmin"){
          query["purchaseHistory"] = {"$elemMatch": {"boughtById": req.user._id}}
        }
      }

      filters.map(filter => {
        let temp = {}
        if (req.user.role === "subadmin"){
          temp["purchaseHistory"] = {"$elemMatch": {"boughtById": req.user._id}}
        }
        switch (filter.group) {
          case 1:
            const adminOnly = ['createdBy', 'createdByRole'] 
            if (adminOnly.includes(filter.key) && req.user.role !== "admin") throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            filter.value = filter.value.trim()
            temp[filter.key] = {"$regex": filter.value, "$options": "i"}
            break;
          case 2:
            let operator = filter.value.range.trim()
            switch (operator) {
              case "greater than":
                temp[filter.key] = {"$gt": filter.value.val}
                break;
              case "less than":
                temp[filter.key] = {"$lt": filter.value.val}
                break;
              case "equals to":
                temp[filter.key] = filter.value.val
                break;
              default:
                break;
            }
            break;
          case 3:
            let start, end
            let val = filter.value 
            val.from = val.from.trim()
            val.to = val.to.trim()
            temp[filter.key] = {}
            if (val.from.length > 0){
              const startLocal = new Date(val.from).getTime()
              start = startLocal - (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
              temp[filter.key]["$gte"] = start
            } 
            if (val.to.length > 0){
              let endLocal = new Date(val.to)
              endLocal.setDate(endLocal.getDate() + 1)
              const endLocalDayPlus = endLocal.getTime()
              end = endLocalDayPlus - (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
              temp[filter.key]["$lte"] = end
            } 
            break;
          case 4:
            filter.value = filter.value.trim()
            temp[filter.key] = filter.value
            break;
          default:
            break;
        }
        if (apply === "" || apply === "all"){
          query = {...query, ...temp}
        }else{
          query.push(temp)
        }
      })

      const skip = (+page-1)*(+limit)
      const manufacturers =  await this.manufacturerModel.find(query, {purchaseHistory:0}).sort({createdAt:-1}).skip(skip).limit(limit)
    
      return manufacturers
    } catch (error) {
      throw error
    }
  }

  // if bought from manufacturer
  async manufacturerFound(req, id){
    try {
      let query = {_id: id}
      if (req.user.role === "subadmin"){
        query["purchaseHistory"] = {"$elemMatch": {"boughtById": req.user._id}}
      }
      const manufacturer = await this.manufacturerModel.findOne(query, {purchaseHistory:0})
      if (!manufacturer) throw new HttpException('Manufacturer not found', HttpStatus.NOT_FOUND)
      return manufacturer

    } catch (error) {
      throw error
    }
  }

  // get manufacturer basic details
  async findId(req, id){
    try {
      const manufacturer = await this.manufacturerFound(req, id)
      return manufacturer
    } catch (error) {
      throw error
    }
  }

  async filters(req, filters, invoice, indi){
    try {

      let condition = []
      if (req.user.role === "subadmin" && invoice){
        condition.push({"$eq": ["$$item.boughtById", req.user._id]})
      }

      filters.map(filter => {   
        let temp = [] 
        switch (filter.group) {
          case 1:
            if (filter.key === "storeName" && req.user.role !== "admin") throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            let temp0 = {}
            filter.value = filter.value.trim()
            temp0["$eq"] = [`$$${indi}.${filter.key}`, filter.value]
            temp.push(temp0)
            break
          case 2:
            let startDate, endDate
            let value = filter.value
            value.from = value.from.trim()
            value.to = value.to.trim()
            if (value.from.length > 0){
              let temp1 = {}
              startDate = new Date(value.from).getTime()
              const start = startDate - (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
              temp1["$gte"] = [`$$${indi}.${filter.key}`, start]
              temp.push(temp1)
            } if (value.to.length > 0){
              let temp2 = {}
              endDate = new Date(value.to)
              endDate.setDate(endDate.getDate() + 1)
              const endLocalDayPlus = endDate.getTime()
              const end = endLocalDayPlus - (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
              temp2["$lt"] = [`$$${indi}.${filter.key}`, end]
              temp.push(temp2)
            } 
            break
          case 3:
              let oper = filter.value.range.trim()
              switch (oper) {
                case "greater than":
                  let temp3 = {}
                  temp3["$gt"] = [`$$${indi}.${filter.key}`, filter.value.val]
                  temp.push(temp3)
                  break;
                case "less than":
                  let temp4 = {}
                  temp4["$lt"] = [`$$${indi}.${filter.key}`, filter.value.val]
                  temp.push(temp4)
                  break;
                case "equals to":
                  let temp5 = {}
                  temp5["$eq"] = [`$$${indi}.${filter.key}`, filter.value.val]
                  temp.push(temp5)
                  break;
                default:
                  break;
              }
            break;
          default:
            break;
        }
        condition = [...condition, ...temp]
      })
      return condition

    } catch (error) {
      throw error
    }
  }
  
  async findPurchaseOrders(req, id, filters){
    try {
      await this.manufacturerFound(req, id)

      let condition = await this.filters(req, filters, true, "item")
            
      let query = [
        {$match: {_id: new mongoose.Types.ObjectId(id)}},
        {$project: {
          purchaseHistory: {
            $filter: {
              input: "$purchaseHistory",
              as: "item",
              cond: {$and: condition}
            }
          }
        }},
        {$project: { 
            "purchaseHistory.purchaseOrderNo": 1,
            "purchaseHistory.purchaseOrderId": 1,
            "purchaseHistory.boughtAt": 1
        }}
      ]
  
      const customer =  await this.manufacturerModel.aggregate(query)
      return customer

    } catch (error) {
      throw error 
    }

  }

  async findProducts(req, id, purchaseOrderId, filters){
    try {

      await this.manufacturerFound(req, id)

      let purchaseCond = [{$eq: ["$$phItem.purchaseOrderId", new mongoose.Types.ObjectId(purchaseOrderId)]}]
      if (req.user.role === "subadmin"){
        purchaseCond.push({$eq: ["$$phItem.boughtById", req.user._id]})
      }

      let condition = await this.filters(req, filters, false, "product")
   
      let query = [
        {$match: {_id: new mongoose.Types.ObjectId(id)}},
        {$project: {
          purchaseHistory: {
            $filter: {
              input: "$purchaseHistory",
              as: "phItem",
              cond: {$and: purchaseCond}
            }
          }
        }},      
        {$project: {
          purchaseHistory: {
            $map: {
              input: "$purchaseHistory",
              as: "item",
              in: {
                purchaseOrderId: "$$item.purchaseOrderId",
                purchaseOrderNo: "$$item.purchaseOrderNo",
                totalItems: "$$item.totalItems",
                subTotal: "$$item.subTotal",
                extraDiscount: "$$item.extraDiscount",
                orderTotal: "$$item.orderTotal",
                storeName: "$$item.storeName",
                boughtBy: "$$item.boughtBy",
                boughtByRole: "$$item.boughtByRole",
                products: {
                  $filter: {
                    input: "$$item.products",
                    as: "product",
                    cond: {$and: condition}
                  }
                }
              }
            }
          }
        }}
      ]
  
      const customer =  await this.manufacturerModel.aggregate(query)
      return customer

    } catch (error) {
      throw error 
    }
  }

  async update(req, id, updateManufacturerDto){
    try {
      if (updateManufacturerDto.email){
        await this.manufacturerExists(updateManufacturerDto.email)
      }
      updateManufacturerDto.updatedAt = new Date()
      updateManufacturerDto.updatedBy = req.user.username
      updateManufacturerDto.updatedById = req.user._id
      updateManufacturerDto.updatedByRole = req.user.role
      
      await this.manufacturerModel.findOneAndUpdate(
        {_id: id,
          $or: [{createdById: req.user._id}, {createdById: {$in: req.user.assignedUnderIds}}]},
          updateManufacturerDto,
        {new: true}
      )
      return
    } catch (error) {
      throw error
    }
  }

  // dropdown
  async allManufacturers(req){
    try {
      const manufacturers = await this.manufacturerModel.find({}, {name:1, email:1, _id:1})
      return manufacturers
    } catch (error) {
      throw error
    }
  }
}
