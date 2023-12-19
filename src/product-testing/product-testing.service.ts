import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductTestingDto } from './dto/create-product-testing.dto';
import { UpdateProductTestingDto } from './dto/update-product-testing.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductTestingInterface } from './interface/productTesting.inteface';

@Injectable()
export class ProductTestingService {

  constructor(@InjectModel('ProductTesting') private readonly productTestingModel: Model<ProductTestingInterface>){}


  // used in bucket
  async findOne(prodId){
    try {
      const productTesting = await this.productTestingModel.findOne({prodId})
      if (!productTesting) throw new HttpException('Product not found', HttpStatus.BAD_REQUEST)
      return productTesting
    } catch (error) {
      throw error
    }
  }
  
  async create(createProductTestingDto) {
    try {
      const productTesting = new this.productTestingModel(createProductTestingDto)
      // console.log(productTesting)
      await productTesting.save()
      return productTesting

    } catch (error) {
      throw error
    }
  }

   //  filters on history
   async filtersOnHistory(filters){
    try {
      let condition = []

      // map through filters
      filters.map(filter => {   
        let temp = [] 
         // apply filter based on group
        switch (filter.group) {
          case 1:
            let temp0 = {}
            filter.value = filter.value.trim()
            temp0["$eq"] = [`$$item.${filter.key}`, filter.value]
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
              temp1["$gte"] = [`$$item.${filter.key}`, start]
              temp.push(temp1)
            } if (value.to.length > 0){
              let temp2 = {}
              endDate = new Date(value.to)
              endDate.setDate(endDate.getDate() + 1)
              const endLocalDayPlus = endDate.getTime()
              const end = endLocalDayPlus - (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
              temp2["$lt"] = [`$$item.${filter.key}`, end]
              temp.push(temp2)
            } 
            break;
          case 3:
              let oper = filter.value.range.trim()
              const milliSecsDay = 24 * 60 * 60 * 1000
              const totalMilliSecs = milliSecsDay * filter.value.val
              switch (oper) {
                case "greater than":
                  let temp3 = {}
                  temp3["$gt"] = [`$$item.${filter.key}`, totalMilliSecs]
                  temp.push(temp3)
                  break;
                case "less than":
                  let temp4 = {}
                  temp4["$lt"] = [`$$item.${filter.key}`, totalMilliSecs]
                  temp.push(temp4)
                  break;
                case "equals to":
                  let temp5 = {}
                  temp5["$lt"] = [`$$item.${filter.key}`, totalMilliSecs]
                  temp.push(temp5)
                  const removeMilliSecs = milliSecsDay * (filter.value.val-1)
                  let temp6 = {}
                  temp6["$gt"] = [`$$item.${filter.key}`, removeMilliSecs]
                  temp.push(temp6)
                  break;
                default:
                  break;
              }
            break;
          default:
            break;

        }
        // merge all the filters
        condition = [...condition, ...temp]
      })

      return condition
    } catch (error) {
      throw error
    }
  }

  async findOneFilters(req, id, filters) {
    try {

      const ObjectId = require('mongodb').ObjectId;
      const prodId = new ObjectId(id)
      
      // Apply filters
      let condition = await this.filtersOnHistory(filters)
      // console.log(condition)

      // Define query
      let query = [
        {$match: {prodId}},
        {$project: {
          testingDetails: {
            $filter: {
              input: "$testingDetails",
              as: "item",
              cond: {$and: condition}
            }
          }
        }}
      ]

      const details = await this.productTestingModel.aggregate(query);

      return details

    } catch (error) {
      throw error
    }
  }

  async update(id, updateProductTestingDto) {
    try {
      await this.productTestingModel.findOneAndUpdate(
        {prodId: id},
        updateProductTestingDto,
        {new: true}
      )
      return
    } catch (error) {
      throw error
    }
  }

  async remove(id) {
    try {
      await this.productTestingModel.findOneAndDelete(
        {prodId: id},
      )
      return
    } catch (error) {
      throw error
    }
  }

  async assignEngineer(time, obj, prodId){
    try {
      const productTesting = await this.productTestingModel.findOne({prodId})
      productTesting.testingDetails.push(obj)
      productTesting.date = time
      // console.log(productTesting)
      return productTesting
    } catch (error) {
      throw error
    }
  }

  async inventoryMove(req, prodId){
    try {
      const product = await this.productTestingModel.findOne({prodId})
      product.closedBy = req.user.username
      product.closedById = req.user._id
      product.closedByRole = req.user.role
      product.closedAt = new Date()
      await product.save()
      return
    } catch (error) {
      throw error
    }
  }

  async inventoryBack(req, prodId){
    try {
      const product = await this.productTestingModel.findOne({prodId})
      product.movedBackBy = req.user.username
      product.movedBackById = req.user._id
      product.movedBackByRole = req.user.role
      product.movedBackAt = new Date()
      // console.log(product)
      await product.save()
      return
    } catch (error) {
      throw error
    }
  }

}
