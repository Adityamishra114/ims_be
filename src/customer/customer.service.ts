import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CustomerInterface } from './interface/customer.interface';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class CustomerService {
  constructor(@InjectModel('Customer') private readonly customerModel: Model<CustomerInterface>){}

    // used in dashboard
    async dashboard(type){
      try {
        
        // get manufacturers 
        const allCustomers = await this.customerModel.find()
  
        // if type is not defined, default pass value
        if (!type) type = "value"
  
        // rearrage
        let customers = []
        let products = []
        for (let i = 0; i < allCustomers.length; i++) {
            const customer = allCustomers[i];
            customers.push(customer.name)
            if (type === 'number'){
              products.push(customer.totalPurchase)
            }else {
              products.push(customer.totalPurchaseVal)
            }
        }
        
        let customersUpdated = {
            customers,
            products
        }
        return customersUpdated
      } catch (error) {
        throw error
      }
    }

  // used in store
  async changeStoreName(storeName, newStoreName){
    try {
      await this.customerModel.updateMany(
        {purchaseHistory: {$elemMatch: {storeName}}},
        {$set: {'purchaseHistory.$.storeName': newStoreName}},
        {new: true}
      )
      return
    } catch (error) {
      throw error
    }
  }


  async customerFound(req, id){
    try {
      let query = {_id: id}
      if (req.user.role === "subadmin"){
        query["purchaseHistory"] = {"$elemMatch": {"soldById": req.user._id}}
      }
      const customer = await this.customerModel.findOne(query)
      if (!customer) throw new HttpException('Customer not found', HttpStatus.NOT_FOUND)
      return customer

    } catch (error) {
      throw error
    }
  }

  async customerExists(email){
    try {
      const customer = await this.findEmail(email)
      if (customer) throw new HttpException('Customer email exists already', HttpStatus.CONFLICT)
      return
    } catch (error) {
      throw error
    }
  }

  async filters(req, filters, invoice, indi){
    try {

      let condition = []
      if (req.user.role === "subadmin" && invoice){
        condition.push({"$eq": ["$$item.soldById", req.user._id]})
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

  async create(req, createCustomerDto) {
    try { 
      await this.customerExists(createCustomerDto.email)

      createCustomerDto.createdBy = req.user.username
      createCustomerDto.createdById = req.user._id
      createCustomerDto.createdByRole = req.user.role
      const newCustomer = new this.customerModel(createCustomerDto)
      await newCustomer.save()
      return newCustomer
      
    } catch (error) {
      throw error
    }
  }

  async findAll(req, allCustomersDto, page, limit){
    try {
      let {filters, apply} = allCustomersDto
      if (filters.length === 0 && apply !== '') {
        apply = 'all'
      }
      
      let query 
      if (apply === "" || apply === "all"){
        query = {}
        if (req.user.role === "subadmin"){
          query["purchaseHistory"] = {"$elemMatch": {"soldById": req.user._id}}
        }
      }else if (apply === "any"){
        query = []
      }

      filters.map(filter => {
        let temp = {}
        if (req.user.role === "subadmin"){
          temp["purchaseHistory"] = {"$elemMatch": {"soldById": req.user._id}}
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
      const customers =  await this.customerModel.find(query, {purchaseHistory:0}).sort({createdAt:-1}).skip(skip).limit(limit)
    
      return customers
    } catch (error) {
      throw error
    }
  }

  async findId(req, id){
    try {
      const customer = await this.customerFound(req, id)
      return customer

    } catch (error) {
      throw error 
    }
  }

  async findInvoice(req, id, filters){
    try {
      await this.customerFound(req, id)

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
            "purchaseHistory.invoiceNo": 1,
            "purchaseHistory.invoiceId": 1,
            "purchaseHistory.soldAt": 1
        }}
      ]
  
      const customer =  await this.customerModel.aggregate(query)
      return customer

    } catch (error) {
      throw error 
    }

  }
  async findProducts(req, id, invoiceId, filters){
    try {

      await this.customerFound(req, id)

      let invoiceCond = [{$eq: ["$$phItem.invoiceId", new mongoose.Types.ObjectId(invoiceId)]}]
      if (req.user.role === "subadmin"){
        invoiceCond.push({$eq: ["$$phItem.soldById", req.user._id]})
      }

      let condition = await this.filters(req, filters, false, "product")
   
      let query = [
        {$match: {_id: new mongoose.Types.ObjectId(id)}},
        {$project: {
          purchaseHistory: {
            $filter: {
              input: "$purchaseHistory",
              as: "phItem",
              cond: {$and: invoiceCond}
            }
          }
        }},      
        {$project: {
          purchaseHistory: {
            $map: {
              input: "$purchaseHistory",
              as: "item",
              in: {
                invoiceId: "$$item.invoiceId",
                invoiceNo: "$$item.invoiceNo",
                totalItems: "$$item.totalItems",
                subTotal: "$$item.subTotal",
                extraDiscount: "$$item.extraDiscount",
                orderTotal: "$$item.orderTotal",
                storeName: "$$item.storeName",
                soldBy: "$$item.soldBy",
                soldByRole: "$$item.soldByRole",
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
  
      const customer =  await this.customerModel.aggregate(query)
      return customer

    } catch (error) {
      throw error 
    }
  }

  async update(req, id, UpdateCustomerDto){
    try {
      if (UpdateCustomerDto.email){
        await this.customerExists(UpdateCustomerDto.email)
      }
      UpdateCustomerDto.updatedAt = new Date()
      UpdateCustomerDto.updatedBy = req.user.username
      UpdateCustomerDto.updatedById = req.user._id
      UpdateCustomerDto.updatedByRole = req.user.role
      
      await this.customerModel.findOneAndUpdate(
        {_id: id,
          $or: [{createdById: req.user._id}, {createdById: {$in: req.user.assignedUnderIds}}]},
        UpdateCustomerDto,
        {new: true}
      )
      return
    } catch (error) {
      throw error
    }
  }

  async findEmail(email){
    try {
      const customer = await this.customerModel.findOne({email})
      return customer
    } catch (error) {
      throw error
    }
  }

  async allCustomers(){
    try {
      const customers = await this.customerModel.find({},{name: 1, email:1, _id:0}).sort({createdAt:-1})
      return customers
    } catch (error) {
      throw error
    }
  }

}
