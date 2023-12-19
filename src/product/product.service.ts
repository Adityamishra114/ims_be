import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductInterface } from './interface/product.interface';
import { CatPhaseService } from 'src/cat-phase/cat-phase.service';
import { StoreService } from 'src/store/store.service';
import { UserService } from 'src/user/user.service';
import { productFields } from 'src/headers';
import { Parser } from 'json2csv';
import { CustomerService } from 'src/customer/customer.service';
import { AllProductsDto } from './dto/allProducts.dto';
import { BucketModule } from 'src/bucket/bucket.module';
import { BucketService } from 'src/bucket/bucket.service';
import { EngineerHistoryService } from 'src/engineer-history/engineer-history.service';
import { ProductPurchaseService } from 'src/product-purchase/product-purchase.service';
import { ProductTestingService } from 'src/product-testing/product-testing.service';
import { ProductSellService } from 'src/product-sell/product-sell.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { StagesService } from 'src/stages/stages.service';
import { TimeService } from 'src/time/time.service';


@Injectable()
export class ProductService {

  constructor(@InjectModel('Product') private readonly productModel: Model<ProductInterface>,
  @Inject(forwardRef(() => StoreService))private readonly storeService: StoreService,
  @Inject(forwardRef(() => UserService))private readonly userSevice: UserService,
  @Inject(forwardRef(() => CatPhaseService))private readonly catPhaseService: CatPhaseService,
  @Inject(forwardRef(() => BucketService))private readonly bucketService: BucketService,
  @Inject(forwardRef(() => EngineerHistoryService))private readonly engineerHistoryService: EngineerHistoryService,
  @Inject(forwardRef(() => ProductPurchaseService))private readonly productPurchaseService: ProductPurchaseService,
  @Inject(forwardRef(() => ProductTestingService))private readonly productTestingService: ProductTestingService,
  @Inject(forwardRef(() => ProductSellService))private readonly productSellService: ProductSellService,
  @Inject(forwardRef(() => ManufacturerService))private readonly manufacturerService: ManufacturerService,
  @Inject(forwardRef(() => StagesService))private readonly stagesService: StagesService,
  @Inject(forwardRef(() => TimeService))private readonly timeService: TimeService,
  private readonly customerService: CustomerService){}


    // used in bucket
    async removeFromBucket(id){
      try {
        await this.productModel.findOneAndUpdate(
          {_id: id}, 
          {$unset: {bucket: 1, bucketId: 1}}, 
          {new:true})
        return
      } catch (error) {
        throw error
      }
    }

  // get products of given category and store
  // used in category
  async findCat(cat){
    try {
      const products = await this.productModel.find({
        category: cat.category,
        storeName: cat.storeName
      })
      return products
    } catch (error) {
      throw error
    }
  }

   // used in customer, product, product purchase
   async findId(req, id){
    try {
      let product 
      product = await this.productModel.findOne({
          _id:id,
          $or: [
            {assignedToIds: req.user._id}, 
            {assignedToIds: {$in: req.user.assignedUnderIds}}
          ]
        }).populate([
          { path: "prodPurchaseId",
          select: "-prodId -_id -__v" }, 
          { path: "prodTestingId",
          select: "-prodId -_id -__v" }, 
          { path: "prodSellId",
          select: "-prodId -_id -__v" }, 
          ])
      if (!product) throw new HttpException('Product not found', HttpStatus.NOT_FOUND)

      return product
    } catch (error) {
      throw error
    }
  }

  // used in store
  async changeStoreName(storeName, newStoreName){
    try {
      await this.productModel.updateMany(
        {storeName},
        {storeName: newStoreName}
      )
      return 'Products have been updated'

    } catch (error) {
      throw error
    }
  }
  
  // used in user
  async changeAssignedTo(username, newUsername){
    try {

      const products = await this.productModel.find({
        assignedTo: username
      })

      if (products.length === 0) return
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        product.assignedTo = product.assignedTo.filter(assignedTo => assignedTo !== username)
        product.assignedTo.push(newUsername)
        await product.save()
      }

      return 'Products have been updated'

    } catch (error) {
      throw error
    }
  }

  // used in category
  async changeCategory(category, newCategory){
    try {
      await this.productModel.updateMany(
        {category},
        {category: newCategory}
      )
      return 'Products have been updated'

    } catch (error) {
      throw error
    }
  }

  // sell product changes, used in bucket
  async sellProduct(id){
    try {
      const product = await this.productModel.findByIdAndUpdate(id,
        {$set: {status: "soldOut"}} ,
        {new:true} 
      )
      if (!product) throw new HttpException('Product not found', HttpStatus.NOT_FOUND)
      return product
    } catch (error) {
      throw error
    }
  }

  // Checking duplication based on barcodeId
  async duplicate(barcodeId){
    try {
      const productExists = await this.productModel.findOne({barcodeId})
      if (productExists) throw new HttpException('Unique barcodeId is required', HttpStatus.BAD_REQUEST)
      return
    } catch (error) {
      throw error
    }
  }

  // GST and discount valid entry
  async validEntry(entry, val){
    try {
      const invalidLength = val.length > 5
      const validValue = +val >= 0 && +val <= 1
      if (!validValue || invalidLength) throw new HttpException(`${entry} ${+val * 100}: Invalid entry`, HttpStatus.BAD_REQUEST)
    } catch (error) {
      throw error
    }
  }

  // If GST and Rate_Unit -> Costs calculation
  async costsCalc(GST, Rate_Unit, quantity){
    try {
        let obj = {}

        // Valid GST number
        await this.validEntry('GST', GST)

        // Total value
        obj["totalValue"] = (+`${+Rate_Unit * +quantity}`).toFixed(2)

        // GST value
        obj["GST"] = (+GST).toFixed(2)
        obj["GSTValue"] = (+`${+obj["totalValue"] * +obj["GST"]}`).toFixed(2)

        // Cost price
        obj["costPrice"] = (+`${+obj["totalValue"] + +obj["GSTValue"]}`).toFixed(2)

        return obj
    } catch (error) {
      throw error
    }
  }

  // Create product
  async create(req, createProductDto) {
    try {
      let {productDetailsDto, productPurchaseDetailsDto, productTestingDetailsDto, productSellDetailsDto, passed} = createProductDto

      console.log('creating')
      //  If duplicate entry comes
      if (productDetailsDto.barcodeId){
        await this.duplicate(productDetailsDto.barcodeId)
      }
     
      // if not allowed to create
      if (req.user.role !== "admin"){
        if (req.user.storeName !== productDetailsDto.storeName) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      }

      // Valid Discount number
      if (productSellDetailsDto.discount){
        if (productSellDetailsDto.discount === "NaN"){
          delete productSellDetailsDto.discount
        }else{
          await this.validEntry('Discount value', productSellDetailsDto.discount)
        }
      }

      // store 
      let store = await this.storeService.findName(productDetailsDto.storeName)

      // if being created by csv or form
      if (!passed) {
        
        // If quantity is not defined, set it to 1
        if(!productPurchaseDetailsDto.quantity){
          productPurchaseDetailsDto.quantity = '1'
        }

        // If GST and Rate_Unit is defied, calculate other costs
        if (productPurchaseDetailsDto.GST && productPurchaseDetailsDto.Rate_Unit){
          const obj = await this.costsCalc(productPurchaseDetailsDto.GST, productPurchaseDetailsDto.Rate_Unit, productPurchaseDetailsDto.quantity)
          productPurchaseDetailsDto = {...productPurchaseDetailsDto, ...obj}
        }

        // category id
        const category = await this.catPhaseService.findName(productDetailsDto.category, productDetailsDto.storeName)
        productDetailsDto.categoryId = category._id.toString()
        
        // store id
        productDetailsDto.storeId = store._id.toString()

        // If store doesn't have subAdmin
        if (store.subAdmins.length === 0){
          throw new HttpException('Store needs to have sub admin',HttpStatus.BAD_REQUEST )
        }

        // get manufacturer name and set
        const manufacturer = await this.manufacturerService.findOne(productPurchaseDetailsDto.manufacturer)
        productPurchaseDetailsDto["manufacturer"] = manufacturer.name
        productPurchaseDetailsDto["manufacturerId"] = manufacturer._id

      }

      // assign to subAdmin
      productDetailsDto.assignedTo = store.subAdmins
      productDetailsDto.assignedToIds = store.subAdminsIds
      productDetailsDto.assignedToRole = "subadmin"

      // set createdBy
      productDetailsDto.createdBy = req.user.username
      productDetailsDto.createdById = req.user._id
      productDetailsDto.createdByRole = req.user.role

      // product id
      const storeSeq = store.seq
      const userSeq = req.user.seq
      const date = Math.floor(new Date().getTime())
      const dateString = `${storeSeq}${userSeq}${date}`
      const Id = BigInt(dateString);
      const hexadecimal = Id.toString(16).toUpperCase()
      productDetailsDto.productId = hexadecimal

      // create product
      const product = new this.productModel(productDetailsDto)

      // add product's id
      productPurchaseDetailsDto["prodId"] = product._id
      productTestingDetailsDto["prodId"] = product._id
      productSellDetailsDto["prodId"] = product._id
      
      // create product purchase
      const prodPurchase = await this.productPurchaseService.create(productPurchaseDetailsDto)
      
      // create product testing
      const prodTesting = await this.productTestingService.create(productTestingDetailsDto)

      // create product sell
      const prodSell = await this.productSellService.create(productSellDetailsDto)

      // Save productPurchase, productTesting and ProductSell ids
      product.prodPurchaseId = prodPurchase._id.toString()
      product.prodTestingId = prodTesting._id.toString()
      product.prodSellId = prodSell._id.toString()

      // add productId in store
      store.productIds.push(product._id.toString())  
      await store.save()

      if (!passed){
        // // add product count to 'ordered' stage
        // await this.stagesService.addProducts('ordered', 1)
      }

      // save product
      await product.save()

      return product

    } catch (error) {
      throw error
    }
  }

  // define query
  async setQuery(req, page, moved, isCommon){
    try {
      let query = {}
      if (isCommon){ 
        query = {["$or"]: [
          {"assignedToIds": req.user._id}, 
          {"assignedToIds": {["$in"]: req.user.assignedUnderIds}}
          ],
          status: page,
        }
        // if an engineer - remove any moved
        if (req.user.role !== "engineer"){
          query["moved"] = moved
        }
      }
      return query
    } catch (error) {
      throw error
    }
  }

  // Filters
  async filters(req, filters, apply, page, moved, isCommon){

    // If no filters are applied check apply must be empty
    if (filters.length === 0 && apply !== '') {
      apply = ''
    }

    try {
      // Define query
      let query
      if (apply === "" || apply === "all"){
        query = await this.setQuery(req, page, moved, isCommon)
      }else if (apply === "any"){
        query = []
      }

      // Map through all the filters
      await Promise.all(filters.map(async filter => {

        // Define temp object
        let temp = await this.setQuery(req, page, moved, isCommon)

        // if GST or discount comes - valid entry
        const checkValid = ["GST", "discount"]
        if (checkValid.includes(filter.key)){
          await this.validEntry(filter.key, filter.value.val)
        }

        // apply filter based on group
        switch (filter.group) {
          case 1:
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
            if (filter.key === "storeName" && req.user.role !== "admin") throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
            if (filter.key === "phase"){
              temp["status"] = "inProgress"
            }
            temp[filter.key] = filter.value
            break;
          default:
            break;
        }

        // Merge all the temp objects
        if (apply === "" || apply === "all"){
          query = {...query, ...temp}
        }else{
          // Add all the temp objects
          query.push(temp)
        }
      }))

      return query
    } catch (error) {
      throw error
    }
  }

  // Find all
  async findFiltersAll(req, allProductsDto, page, limit) {
    try{
      const {filters, filters1, filters2, filters3, apply, statusPage, type, moved, storeName} = allProductsDto

      // Apply filters on product details
      let query = {}
      if (moved || filters){
        query = await this.filters(req, filters, apply, statusPage, moved, true)
      }
      
      // if in bucket - dont show
      query["bucket"] = {"$eq": null}
  
      // if inventory page, add storeName if given
      if (statusPage === "completed" && storeName){
        query["storeName"] = storeName 
      }
      // console.log(query)

      // declare queries
      let query1 = {}
      let query2 = {}
      let query3 = {}

      // Apply filters on purchase
      if (filters1){
        query1 = await this.filters(req, filters1, apply, statusPage, false, false)
      }

      // Apply filters on testing
      if (filters2){
        query2 = await this.filters(req, filters2, apply, statusPage, false, false)
      }

      // Apply filters on sell
      if (filters3){
        query3 = await this.filters(req, filters3, apply, statusPage, false, false)
      }

      // Apply pagination and get products
      const skip = (+page-1)*(+limit)
      let products
      if (apply === '' || apply === "all"){
        products = await this.productModel
                  .find(query)
                  .populate([
                    { path: "prodPurchaseId",
                      select: "-prodId -_id -__v",
                      match: query1 
                    },
                    { path: "prodTestingId",
                      select: "-prodId -_id -__v",
                      match: query2 
                    },
                    { path: "prodSellId",
                      select: "-prodId -_id -__v",
                      match: query3 
                    }
                  ])
                  .sort({updatedAt:-1, createdAt: -1})
                  .skip(skip).limit(limit)
      }

      products = products.filter(prod => {
       if (prod.prodPurchaseId && prod.prodTestingId && prod.prodSellId) return prod
      })
      return products

    } catch (error) {
      throw error
    }
  }

  async findOneFilters(req, id: String, filters) {
    try {
     
      // Whether product exists
      await this.findId(req, id)

      const productHistory = await this.productTestingService.findOneFilters(req, id, filters)
      
      return productHistory
    
    } catch (error) {
      throw error
    }
  }

  // Update product
  async update(req, id: String, updateProductDto) {
    try {
      let {productDetailsDto, productPurchaseDetailsDto, productTestingDetailsDto, productSellDetailsDto} = updateProductDto

      const product = await this.findId(req, id)

       //  If duplicate entry comes
       if (productDetailsDto.barcodeId){
         await this.duplicate(productDetailsDto.barcodeId)
       }
      
      // If under testing or soldOut - not allowed to edit
      const notAllowed = ["inProgress", "soldOut"]
      if (notAllowed.indexOf(product.status) !== -1) throw new HttpException(`Can not edit product when ${product.status}`, HttpStatus.BAD_REQUEST)

      // category changes 
      if (productDetailsDto.category) {
        const newCat = await this.catPhaseService.findName(productDetailsDto.category, product.storeName)
        productDetailsDto.categoryId = newCat._id.toString()
        productDetailsDto.status = "new"
      }

      // If quantity is not defined, set it to prev value
      if(!productPurchaseDetailsDto.quantity){
        productPurchaseDetailsDto.quantity = product.prodPurchaseId.quantity
      }

      // If GST and Rate_Unit is defied, calculate other costs
      if (productPurchaseDetailsDto.GST && productPurchaseDetailsDto?.Rate_Unit){
        const obj = await this.costsCalc(productPurchaseDetailsDto.GST, productPurchaseDetailsDto.Rate_Unit, productPurchaseDetailsDto.quantity)
        productPurchaseDetailsDto = {...productPurchaseDetailsDto, ...obj}
      }
     
      // Valid Discount number
      if (productSellDetailsDto.discount){
        if (productSellDetailsDto.discount === "NaN"){
          delete productSellDetailsDto.discount
        }else{
          await this.validEntry('Discount value', productSellDetailsDto.discount)
        }
      }

      productDetailsDto.updatedAt = new Date()
      productDetailsDto.updatedBy = req.user.username
      productDetailsDto.updatedById = req.user._id
      productDetailsDto.updatedByRole = req.user.role

      // Update product
      await this.productModel.findByIdAndUpdate(id, productDetailsDto, {new:true})
      
      // Update product purchase
      await this.productPurchaseService.update(product._id, productPurchaseDetailsDto)
      
      // Update product testing
      await this.productTestingService.update(product._id, productTestingDetailsDto)
      
      // Update product sell
      await this.productSellService.update(product._id, productSellDetailsDto)

      return
    } catch (error) {
      throw error
    }
  }

  async remove(req, id: String) {
    try {
      const product = await this.findId(req, id)

      // only if it is not assigned
      if (product.status === "inProgress") return product.productId

      // delete from products
      await this.productModel.findByIdAndDelete(id)
      
      // delete from productPurchase
      await this.productPurchaseService.remove(product._id)
      
      // delete from productTesting
      await this.productTestingService.remove(product._id)
      
      // delete from productSell
      await this.productSellService.remove(product._id)
      
      return null

    } catch (error) {
      throw error
    }
  }

  async findBarcode(req, id, type){
    try {
      const barcodeId = id.trim()
      const product = await this.productModel.findOne({
          barcodeId,
          $or: [{assignedToIds: req.user._id}, {assignedToIds: {$in: req.user.assignedUnderIds}}]
        }).populate([
          { path: "prodPurchaseId",
          select: "-prodId -_id -__v" }, 
          { path: "prodTestingId",
          select: "-prodId -_id -__v" }, 
          { path: "prodSellId",
          select: "-prodId -_id -__v" }, 
          ])
      if (!product) throw new HttpException('Product not found', HttpStatus.NOT_FOUND)

      const purchase = ['ordered', 'received']
      const sell = ['soldOut']
      const testing = ['new', 'inProgress', 'pending', 'error', 'completed']
      switch (type) {
        case 'testing':
          if (purchase.includes(product.status)) throw new HttpException('Product is in GRN', HttpStatus.BAD_REQUEST)
          if (sell.includes(product.status)) throw new HttpException('Product is soldOut', HttpStatus.BAD_REQUEST)  
          break;
        case 'purchase': 
          if (testing.includes(product.status)) throw new HttpException('Product is in testing', HttpStatus.BAD_REQUEST)
          if (sell.includes(product.status)) throw new HttpException('Product is soldOut', HttpStatus.BAD_REQUEST)
          break
        case 'sell': 
          if (testing.includes(product.status)) throw new HttpException('Product is in testing', HttpStatus.BAD_REQUEST)
          if (purchase.includes(product.status)) throw new HttpException('Product is in GRN', HttpStatus.BAD_REQUEST)
          break
        default:
          break;
      }

      return product
    } catch (error) {
      throw error
    }
  }

  async storesTransfer(req, id, store1, store2){
    try {
      const product = await this.findId(req, id)

      // If under testing or soldOut - not allowed to move
      const notAllowed = ["inProgress", "soldOut"]
      if (notAllowed.indexOf(product.status) !== -1) {
        return product
      }

      // if in someone's bucket - not allowed to move
      if (product.bucket){
        return product
      }

      // if both the stores are valid entry
      const validStores = await this.storeService.allValidStores()
      if (validStores.indexOf(store1) === -1 || validStores.indexOf(store2) === -1){
        throw new HttpException('Invalid stores', HttpStatus.BAD_REQUEST)
      }
      if (store1 === store2){
        throw new HttpException('Invalid stores', HttpStatus.BAD_REQUEST)
      }
      if (product.storeName !== store1){
        return product
      }

      // change category id
      const cat = await this.catPhaseService.findName(product.category, store2)
      product.categoryId = cat._id.toString()

      // change status to moved
      product.moved = true
      product.prevStore = store1
      product.storeShiftBy = req.user.username
      product.storeShiftById = req.user._id
      product.storeShiftByRole = req.user.role
      product.storeShiftAt = Date.now()

      // change storeName
      product.storeName = store2

      // get store
      const store = await this.storeService.findName(store2)

      // if no subAdmin found throw error
      if (store.subAdmins.length == 0) throw new HttpException('Subadmin is required', HttpStatus.BAD_REQUEST)

      // remove productId from prev store
      await this.storeService.removeProduct(store1, product._id)

      // add productId to new store
      await this.storeService.addProduct(store2, product._id)

      // make changes in stages
      await this.stagesService.removeProducts(store1, product.status, 1)
      await this.stagesService.addProducts(store2, product.status, 1)

      // add into time's moved from and to
      const month = new Date().getMonth()
      const year = new Date().getFullYear()
      await this.timeService.addStoreFrom(store1, month, year, 1)
      await this.timeService.addStoreTo(store2, month, year, 1)

      //assign product to new store's subAdmins
      product.storeId = store._id.toString()
      product.assignedTo = store.subAdmins
      product.assignedToIds = store.subAdminsIds
      product.assignedToRole = 'subAdmin'

      // save changes
      // console.log(product)
      await product.save()
      return null

    } catch (error) {
      throw error
    }
  }

  async getMonthYear(date){
    try {
      const dateString = new Date(date).toISOString().split('T')[0].split('-')
      const time = dateString.slice(0,2).join('/')
      return time
    } catch (error) {
      throw error
    }
  }

  async assignEngineer(req, id, assignEngineerDto){
    const {engineerId, phase} = assignEngineerDto
    try {
      const product = await this.findId(req, id)
      const engineer = await this.userSevice.findOne(req, engineerId)

      const allowed = ["new", "pending", "error"]
      if (allowed.indexOf(product.status) === -1){
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
      }

      // Whether valid phase
      const cat = await this.catPhaseService.findName(product.category, product.storeName)
      if (cat.categoryPhases.indexOf(phase) === -1) throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)

      // assign product to engineerId
      product.assignedTo = [engineer.username]
      product.assignedToIds = [engineer._id.toString()]
      product.assignedToRole = engineer.role
      product.updatedAt = new Date()

      // add to testing details
      const obj = {}
      obj["assignedBy"] = req.user.username
      obj["assignedById"] = req.user._id
      obj["assignedByRole"] = req.user.role
      obj["assignedTo"] = engineer.username
      obj["assignedToIds"] = engineer._id.toString()
      obj["assignedAt"] = Date.now()
      obj["phase"] = phase
      if (assignEngineerDto.remark){
        obj["task"] = assignEngineerDto.remark
      }
      if (assignEngineerDto.dueDate){
        const dueDate = new Date(assignEngineerDto.dueDate).getTime()
        if (dueDate <= Date.now()) throw new HttpException('Invalid date', HttpStatus.BAD_REQUEST)
        obj["dueDate"] = new Date(assignEngineerDto.dueDate).getTime()
      }
       
      // generate date
      const todayDate = (new Date()).getTime() + (5*60*60*1000 + 30*60*1000)
      const time = await this.getMonthYear(todayDate)

      // pass time and testing details to product-testing
      const productTesting = await this.productTestingService.assignEngineer(time, obj, id)

      // product details
      const productObj = {
        productId: product._id.toString(),
        productName: product.productName,
        description: product.description,
        brand: product.brand,
        category: product.category
      }

      const engineerObj = {...productObj, ...obj, time}

      // save to engineer history
      await this.engineerHistoryService.assignedProduct(engineer.workingHistory, engineerObj)

      // remove product count from product.status stage
      await this.stagesService.removeProducts(product.storeName, product.status,  1)

      // add product count to 'inProgress' stage
      await this.stagesService.addProducts(product.storeName, 'inProgress',  1)

      // Change product status
      product.status = "inProgress"
      product.phase = phase

      // Save changes to product
      await productTesting.save()
      await product.save()
      return null

    } catch (error) {
      throw error
    }
  }

  async closeProduct(req, id, status, remark, materials){
    try {

      const product = await this.productModel.findOne({
        _id:id,
        assignedToIds: req.user._id
      })
      if (!product) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)

      // make changes in product status based on status sent by engineer
      if (status === "success"){
        product.status = "pending"
      }else if (status === "failed"){
        product.status = "error"
      }
      
      // Add testingDetails to product
      const productTesting = await this.productTestingService.findOne(id)
      const lastObj = productTesting.testingDetails[productTesting.testingDetails.length - 1]
      lastObj.status = status
      lastObj.remark = remark
      lastObj.closedAt = Date.now()
      lastObj.duration = Date.now() - lastObj.assignedAt
      if (lastObj.dueDate){
        if (lastObj.closedAt <= lastObj.dueDate){
          lastObj.completed = "ontime"
        }else{
          lastObj.completed = "overdue"
        }
      }

      const store = await this.storeService.findName(product.storeName)

      // Change assignedTo of product to subAdmin of store
      product.assignedTo = store.subAdmins
      product.assignedToIds = store.subAdminsIds
      product.assignedToRole = "subadmin"
      product.updatedAt = new Date()
      
      let obj = {
        status,
        remark,
        closedAt: Date.now(),
        duration: Date.now() - lastObj.assignedAt,
        completed: lastObj.completed,
      }
      
      // make changes in engineer history
      await this.engineerHistoryService.closeProduct(req.user.workingHistory, id, obj, productTesting.date, materials)

      productTesting.date = ''

      if (product.status === "error"){
        // add into time's damaged goods
        const month = new Date().getMonth()
        const year = new Date().getFullYear()
        await this.timeService.addDamagedGoods(product.storeName, month, year, 1)
      }

      // remove product count from 'inProgress' stage
      await this.stagesService.removeProducts(product.storeName, 'inProgress',  1)

      // add product count to product.status stage
      await this.stagesService.addProducts(product.storeName, product.status,  1)

      // Save changes to product
      await product.save()
      await productTesting.save()
      return

    } catch (error) {
      throw error
    }
  }

  async inventoryMove(req, id){
    try {
      const product = await this.findId(req, id)

      const allowed = ["new", "pending",]
      if (allowed.indexOf(product.status) === -1){
        return product.productId
      }
      
      await this.productTestingService.inventoryMove(req, id)
      
      // remove product count from product.status stage
      await this.stagesService.removeProducts(product.storeName, product.status,  1)
      
      // add product count to 'completed' stage
      await this.stagesService.addProducts(product.storeName, 'completed',  1)
      
      product.status = 'completed'
      await product.save()
      return null
    } catch (error) {
      throw error
    }
  }

  async inventoryBack(req, id){
    try {
      const product = await this.findId(req, id)
      if (product.status !== "completed"){
        return product.productId
      }

      await this.productTestingService.inventoryBack(req, id)

      product.status = 'pending'

      // remove product count from 'completed' stage
      await this.stagesService.removeProducts(product.storeName, 'completed',  1)

      // add product count to 'pending' stage
      await this.stagesService.addProducts(product.storeName, 'pending',  1)
      
      // console.log(product)
      await product.save()

      return null
    } catch (error) {
      throw error
    }
  }

  // async inventory(req, allProductsDto, page, limit){
  //   const {filters, apply} = allProductsDto
  //   try{
  //     let query = await this.filters(req, filters, apply, true)
      
  //     // if storeName exists then add in to query
  //     if (allProductsDto.storeName){
  //       query["storeName"] = allProductsDto.storeName 
  //     }
  //     const skip = (+page-1)*(+limit)

  //     console.log(query)
  //     let products
  //     if (apply === '' || apply === "all"){
  //       products = await this.productModel.find(query).sort({closedAt:-1}).skip(skip).limit(limit)
  //     }else{
  //       products = await this.productModel.find({$or: query}).sort({closedAt:-1}).skip(skip).limit(limit)
  //     }

  //     return products

  //   } catch (error) {
  //     throw error
  //   }
  // }

  // async exportData(req, allProductsDto, res){
  //   try {
  //     const products = await this.findAll(req, allProductsDto, 1, Number.MAX_SAFE_INTEGER)
  //     const fields = productFields

  //     const parser = new Parser({
  //       fields
  //     })

  //     const json = []
  //     let productObj = {}
  //     products.forEach(product => {
  //       for (let index = 0; index < fields.length; index++) {
  //         productObj[fields[index]] = product[fields[index]] || null          
  //       }
  //       json.push({...productObj})
  //     })

  //     const csv = parser.parse(json)
  //     res.header('Content-Type', 'text/csv')
  //     res.attachment('product.csv')
  //     return res.send(csv)

  //   } catch (error) {
  //     throw error
  //   }
  // }

  // async createMany(req, data, message){
  //   // console.log(req.user)
  //   try {
  //     const requiredFields = ["productName", "category", "storeName", "barcodeId"]
  //     const validCategories = await this.catPhaseService.allValidCats(req)
  //     let validStores
  //     if (req.user.role === "admin"){
  //       validStores = await this.storeService.allValidStores()
  //     }else{
  //       validStores = [req.user.storeName]
  //     }
  //     let missingFields = []
  //     let invalidFields = []
  //     let categories = []
  //     let stores = []
  //     data = data.map((obj) => {
  //       for (let key in obj) {  
  //         if (requiredFields.includes(key) && obj[key] === '') {
  //           missingFields.push({field: key, barcodeId: obj.barcodeId})
  //           continue
  //         }
  //         if(obj[key] === ""){
  //           delete obj[key]
  //           continue
  //         }
  //         obj[key] = obj[key].trim()
  //         if (key === "category" && validCategories.indexOf(obj[key]) === -1){
  //           if (categories.indexOf(obj[key]) === -1){
  //             categories.push(obj[key])
  //           }
  //         }
  //         else if (key === "storeName" && validStores.indexOf(obj[key]) === -1){
  //           if (stores.indexOf(obj[key]) === -1){
  //             stores.push(obj[key])
  //           }
  //         }
  //         else if (key === "GST" || key === "discount"){
  //           // console.log(obj[key])
  //           const allowed = obj[key] >= 0 && obj[key] <= 1
  //           const invalidValue = `${obj[key]}`.length > 5
  //           if (!allowed || invalidValue) {
  //             invalidFields.push({field: key, barcodeId: obj.barcodeId})
  //           }
  //         }
  //         const trimmedKey = key.trim();
  //         if (key !== trimmedKey) {
  //           obj[trimmedKey] = obj[key];
  //           delete obj[key];
  //         }
  //       }
  //       return obj;
  //   })

  //   if (categories.length > 0){
  //     message += `\nCategories ${categories} do not exist.`
  //   }

  //   if (stores.length > 0){
  //     message +=`\nStores invalid: ${stores}.`
  //   }
    
  //   if (missingFields.length > 0){
  //     console.log(missingFields)
  //     message += '\nRequired fields are missing for:'
  //     for (let err = 0; err < missingFields.length; err++) {
  //       const error = missingFields[err]
  //       message += ` [field: ${error.field}, barcodeId: ${error.barcodeId}],`
  //     }
  //   }
  //   if (message){
  //     message = message.slice(0,-1) + '.'
  //   }
    
  //   if (invalidFields.length > 0){
  //     console.log(invalidFields)
  //     message += '\nInvalid field values for:'
  //     for (let err = 0; err < invalidFields.length; err++) {
  //       const error = invalidFields[err]
  //       message += ` [field: ${error.field}, barcodeId: ${error.barcodeId}],`
  //     }
  //   }
  //   if (message){
  //     message = message.slice(0,-1) + '.'
  //   }

  //   let repeatedBarcodeId = []
  //   for (let index = 0; index < data.length; index++) {
  //     try {
  //       await this.duplicate(data[index].barcodeId)
  //     } catch (error) {
  //       repeatedBarcodeId.push(data[index].barcodeId)
  //       continue
  //     }
  //   }

  //   if (repeatedBarcodeId.length > 0){
  //     message += `\nBarcodeIds ${repeatedBarcodeId} already exists.`
  //   }

  //   if (message){
  //     // console.log(message)
  //     throw new HttpException(message, HttpStatus.BAD_REQUEST)
  //   }

  //   for (let index = 0; index < data.length; index++) {
  //     await this.create(req, data[index])
  //   }
    
  //   return 'Products have been created successfully'
  //   } catch (error) {
  //     throw error
  //   }
  // }

   

}
