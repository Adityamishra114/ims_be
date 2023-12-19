import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateCatPhaseDto } from './dto/create-cat-phase.dto';
import { UpdateCatPhaseDto } from './dto/update-cat-phase.dto';
import { Model } from 'mongoose';
import { CatPhaseInterface } from './interface/catPahse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ProductService } from 'src/product/product.service';
import { catPhaseFields } from 'src/headers';
import { Parser } from 'json2csv';
import { log } from 'console';

@Injectable()
export class CatPhaseService {
  constructor(@InjectModel('CatPhase') private readonly catPhaseModel: Model<CatPhaseInterface>,
  @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService){}

  // used in store
  async changeStoreName(storeName, newStoreName){
    try {
      await this.catPhaseModel.updateMany(
        {storeName},
        {storeName: newStoreName}
      )
      return 

    } catch (error) {
      throw error
    }
  }

  // Find category based on category name
  // used in product
  async findName(category, storeName){
    try {
      const cat = await this.catPhaseModel.findOne({category, storeName})
      if (!cat) throw new HttpException(`Category ${category} not found`, HttpStatus.NOT_FOUND)
      return cat
    } catch (error) {
      throw error
    }
  }

  // Categories list to be used in CSV import in product
  // used in product
  async allValidCats(req){
    try {
      let query = {}

      // if without admin, add storeName filter
      if (req.user.role !== 'admin'){
        query["storeName"] = req.user.storeName
      }

      const cats = await this.catPhaseModel.find(query,{category:1, _id:0})
      const validCats = []
      cats.map(cat => {
        validCats.push(cat.category)
      })
      return validCats
    } catch (error) {
      throw error
    }
  }

  // If category already exists
  async catExists(category, storeName){
    try {
      const catExists = await this.catPhaseModel.findOne({
        category,
        storeName
      })
      return catExists
      
    } catch (error) {
      throw error
    }
  }
  // Create categoy
  async create(req, createCatPhaseDto) {
    try {

      const catExists = await this.catExists(createCatPhaseDto.category, createCatPhaseDto.storeName)
      if (catExists) throw new HttpException('Category exists already', HttpStatus.BAD_REQUEST)

      // if not allowed to create
      if (req.user.role !== "admin"){
        if (req.user.storeName !== createCatPhaseDto.storeName) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      }
    
      // Set created by info
      createCatPhaseDto.createdBy = req.user.username
      createCatPhaseDto.createdById = req.user._id
      createCatPhaseDto.createdByRole = req.user.role

      // Create new category 
      const cat = new this.catPhaseModel(createCatPhaseDto)
      await cat.save()
      return cat

    } catch (error) {
      throw error
    }
  }

  // Get all categories
  async findAll(req, filter, storeName) {
    try {
      let query = {}

      // if without admin, add storeName filter
      if (req.user.role != 'admin'){
        query["storeName"] = req.user.storeName
      }else if (storeName){
        query["storeName"] = storeName
      }

      // Only category based filter
      if (filter && filter.key !== "category") throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
      if (filter){
        query[filter.key] = {"$regex": filter.value, "$options": "i"}
      }

      const cats = await this.catPhaseModel.find(query,{__v:0}).sort({createdAt: -1})
      return cats

    } catch (error) {
      throw error
    }
  }

  async findCategory(req, id){
    try {
      let query = {_id:id}

      // if without admin, add storeName filter
      if (req.user.role != 'admin'){
        query["storeName"] = req.user.storeName
      }

      const cat = await this.catPhaseModel.findOne(query,{__v:0})
      if (!cat) throw new HttpException('Category not found', HttpStatus.NOT_FOUND)
      return cat
    } catch (error) {
      throw error
    }
  }

  async findOne(req, id: String) {
    try {
      const cat = await this.findCategory(req, id)
      return cat
    } catch (error) {
      throw error
    }
  }

  async update(req, id: String, updateCatPhaseDto) {
    try {

      const cat = await this.findCategory(req, id)

      if (updateCatPhaseDto.category){

        // Find all the products of cat.category and change it to new category 
        await this.productService.changeCategory(cat.category, updateCatPhaseDto.category)
      }

      updateCatPhaseDto.updatedAt = new Date()
      updateCatPhaseDto.updatedBy = req.user.username
      updateCatPhaseDto.updatedById = req.user._id
      updateCatPhaseDto.updatedByRole = req.user.role
      await this.catPhaseModel.findByIdAndUpdate(id, updateCatPhaseDto, {new: true})

      return
    } catch (error) {
     throw error 
    }
  }

  // delete category
  async remove(req, id){
    try {
      const cat = await this.findCategory(req, id)
      const products = await this.productService.findCat(cat)
      if (products.length > 0){
        throw new HttpException(`Products exist for category: ${cat.category}`, HttpStatus.BAD_REQUEST)
      }

      await this.catPhaseModel.findByIdAndDelete(id)
      return

    } catch (error) {
      throw error
    }
  }

  // Catogories list
  async allCats(storeName){
    try {
      const cats = await this.catPhaseModel.find({storeName},{category:1, _id:0})
      return cats
    } catch (error) {
      throw error

    }
  }

  // Phases list for given category
  async allPhases(category){
    try {
      const phases = await this.catPhaseModel.findOne({category}, {categoryPhases: 1, _id:0})
      return phases
    } catch (error) {
      throw error
    }
  }

  async exportData(filter, req, res, storeName){
    try {
      const catPhases = await this.findAll(req,filter, storeName)
      let fields = catPhaseFields
      let numOfPhases = 0
      catPhases.forEach(category => {
        if(category.categoryPhases.length > numOfPhases){
          numOfPhases = category.categoryPhases.length
        }
      })
      for (let i = 0; i < numOfPhases; i++) {
        fields = [...fields, `phase ${i+1}`] 
      } 

      const parser = new Parser({
        fields
      })

      const json = []
      let catObj = {}
      let i
      catPhases.forEach(category => {
        for (let index = 0; index < fields.length; index++) {
          if (/phase/.test(fields[index])){
            i = +fields[index].split(' ')[1]
            catObj[fields[index]] = category.categoryPhases[i-1] || null
          }else{
            catObj[fields[index]] = category[fields[index]] || null
          }
        }
        json.push({...catObj})
      })

      const csv = parser.parse(json)
      res.header('Content-Type', 'text/csv')
      res.attachment('categories.csv')
      return res.send(csv)

    } catch (error) {
      throw error
    }
  }

}
