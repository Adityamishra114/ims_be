import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseOrderInterface } from './interface/purchaseOrder.interface';
import { CatPhaseService } from 'src/cat-phase/cat-phase.service';
import { StoreService } from 'src/store/store.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { ProductService } from 'src/product/product.service';
import { StagesService } from 'src/stages/stages.service';
import { TimeService } from 'src/time/time.service';
import { purchaseOrderFields } from 'src/headers';
import { Parser } from 'json2csv';

@Injectable()
export class PurchaseOrderService {

  constructor(@InjectModel('PurchaseOrder') private readonly purchaseOrderModel: Model<PurchaseOrderInterface>,
  @Inject(forwardRef(() => CatPhaseService))private readonly catPhaseService: CatPhaseService,
  @Inject(forwardRef(() => StoreService))private readonly storeService: StoreService,
  @Inject(forwardRef(() => ManufacturerService))private readonly manufacturerService: ManufacturerService,
  @Inject(forwardRef(() => ProductService))private readonly productService: ProductService,
  @Inject(forwardRef(() => StagesService))private readonly stagesService: StagesService,
  @Inject(forwardRef(() => TimeService)) private readonly timeService: TimeService,){}

  // used in store
  async changeStoreName(storeName, newStoreName){
    try {
      await this.purchaseOrderModel.updateMany(
        {storeName},
        {storeName: newStoreName}
      )
      return 

    } catch (error) {
      throw error
    }
  }

  // GST, discount valid entry
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
   async costsCalc(GST, Rate_Unit, quantity, discount){
    try {
        let obj = {}

        // Valid GST number 
        await this.validEntry('GST', GST)
        
        // Total value
        obj["totalValue"] = (+`${+Rate_Unit * +quantity}`).toFixed(2)

        // GST value
        obj["GST"] = (+GST).toFixed(2)
        obj["GSTValue"] = (+`${+obj["totalValue"] * +obj["GST"]}`).toFixed(2)
        
        // if discount
        if (discount){

          // Valid discount 
          await this.validEntry('discount', discount)
          obj["discount"] = (+discount).toFixed(2)
          obj["discountedPrice"] = (+obj["totalValue"] - (+obj["discount"] * +obj["totalValue"])).toFixed()
          // Cost price
          obj["costPrice"] = (+`${+obj["discountedPrice"] + +obj["GSTValue"]}`).toFixed(2)
        }else{
          // Cost price
          obj["costPrice"] = (+`${+obj["totalValue"] + +obj["GSTValue"]}`).toFixed(2)
        }

        return obj
    } catch (error) {
      throw error
    }
  }

  async squence(storeName){
    try {

      // Get today's date at 00:00:00
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayUTC = startOfToday.getTime() 
      const start = new Date(startOfTodayUTC)

      // Get tomorrow's date at 00:00:00
      const startOfTomorrowUTC = startOfTodayUTC + 24 * 60 * 60 * 1000
      const end = new Date(startOfTomorrowUTC)

      // Use the two dates to filter documents
      const invoice = await this.purchaseOrderModel.find({
        createdAt: {
          $gte: start,
          $lt: end
        }
      });

      if (invoice.length === 0){
        return 0
      }
      return invoice[invoice.length - 1]

    } catch (error) {
      throw error
    }
  }

  async productsCost(products, storeName){
    try {
      let subTotal = 0
      for (let i = 0; i < products.length; i++) {
        let product = products[i];

        // category and storename should be valid for each product
        await this.catPhaseService.findName(product.category, storeName)

        // calculate costs 
        const obj = await this.costsCalc(product.GST, product.Rate_Unit, product.quantity, product.discount)
        products[i] = {...product, ...obj}

        // subTotal calculation
        subTotal += +products[i].costPrice
      }
      return subTotal

    } catch (error) {
      throw error
    }
  }

  async create(req, createPurchaseOrderDto) {
    try {
      let {products, storeName} = createPurchaseOrderDto

      // valid manufacturer
      const manufacturer = await this.manufacturerService.findOne(createPurchaseOrderDto.manufacturerId)
      createPurchaseOrderDto.manufacturer = manufacturer.name

      // iterate through ech product
      let subTotal = await this.productsCost(products, storeName)

      // link with store
      const store = await this.storeService.findName(storeName)
      if (store.subAdmins.length === 0) throw new HttpException('Assign subadmin to store', HttpStatus.FORBIDDEN)
      createPurchaseOrderDto.storeId = store._id.toString()
      
      // totalItems, extraDiscount, orderTotal
      createPurchaseOrderDto.totalItems = products.length
      createPurchaseOrderDto.subTotal = (subTotal).toFixed(2)
      if (createPurchaseOrderDto.extraDiscount){
        createPurchaseOrderDto.orderTotal = (+createPurchaseOrderDto.subTotal - (+createPurchaseOrderDto.subTotal * +createPurchaseOrderDto.extraDiscount)).toFixed(2)
      }else{
        createPurchaseOrderDto.orderTotal = createPurchaseOrderDto.subTotal
      }

      // PONo
      const date = Date.now()
      const ISTdate = date + (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
      const ISTDate = new Date(ISTdate) 
        
      const stringDate = ISTDate.toISOString().split('T')[0];
      let purchaseOrderNo = `${stringDate}_PON_`

      // Create seq
      const lastPon = await this.squence(storeName)
      
      if (lastPon){
        console.log(lastPon);
        purchaseOrderNo += `${lastPon.seq+1}`
        createPurchaseOrderDto.seq = lastPon.seq + 1
      }else{
        purchaseOrderNo += `${1}`
      }
      createPurchaseOrderDto.purchaseOrderNo = purchaseOrderNo
      
      // createdBy
      createPurchaseOrderDto.createdBy = req.user.username
      createPurchaseOrderDto.createdById = req.user._id
      createPurchaseOrderDto.createdByRole = req.user.role
      
      
      // create purchase order
      const purchaseOrder = new this.purchaseOrderModel(createPurchaseOrderDto)
      console.log(purchaseOrder)
      await purchaseOrder.save()
      return purchaseOrder

    } catch (error) {
      throw error
    }
  }

  async findAll(req, AllPurchaseOrderDto, page, limit) {
    try {
      const {filter, statusPage, storeName} = AllPurchaseOrderDto

      // If valid filter
      if (filter && filter.key !== "purchaseOrderNo") throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
      let query = {}
      if (filter){
        query[filter.key] = filter.value
      }

      switch (statusPage) {
        case 'pending':
        case 'accepted':
        case 'rejected':
          if (req.user.role === 'admin'){
            if (storeName) { query['storeName'] = storeName }
          }else{
            query['createdById'] = req.user._id
          }
          query['status'] = statusPage
          break
        case 'all':
          if (req.user.role === 'admin'){
            if (storeName) { query['storeName'] = storeName }
          }else{
            query['storeName'] = req.user.storeName
          }
          break
        default:
          break;
      }
      
      // console.log(query)
      const skip = (+page-1) * +limit
      const purchaseOrders = await this.purchaseOrderModel.find(query, {products:0}).sort({createdAt: -1}).skip(skip).limit(+limit)

      return purchaseOrders
    } catch (error) {
      throw error
    }
  }

  async findOne(req, id) {
    try {
      let query = {_id:id}
  
      if (req.user.role === 'subadmin'){
        query["createdById"] = req.user._id
      }

      const purchaseOrder = await this.purchaseOrderModel.findOne(query)
      .populate([{
        path: 'manufacturerId',
        select: '-purchaseHistory'
      },
      {
        path: 'storeId',
        select: '-engineers -subAdmins -_id'
      }])
      
      if (!purchaseOrder) throw new HttpException('Purchase order not found', HttpStatus.NOT_FOUND)
      return purchaseOrder
    } catch (error) {
      throw error
    }
  }

  // without populating
  async purchaseOrderExists(req, id) {
    try {
      let query = {_id:id}
  
      if (req.user.role === 'subadmin'){
        query["createdById"] = req.user._id
      }

      const purchaseOrder = await this.purchaseOrderModel.findOne(query)      
      if (!purchaseOrder) throw new HttpException('Purchase order not found', HttpStatus.NOT_FOUND)
      return purchaseOrder
    } catch (error) {
      throw error
    }
  }


  async update(req, id, updatePurchaseOrderDto) {
    try {
      console.log(updatePurchaseOrderDto)
      const {storeName, extraDiscount, manufacturerId, products} = updatePurchaseOrderDto

      // if purchase order exists
      const purchaseOrder = await this.purchaseOrderExists(req, id)

      // if not in pending status
      if (purchaseOrder.status !== "pending") throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)

      // if storeName 
      if (storeName){
        const store = await this.storeService.findName(storeName)
        purchaseOrder.storeName = store.storeName
        purchaseOrder.storeId = store._id.toString()
      }

      // if manufacturer
      if (manufacturerId){
        // valid manufacturer
        const manufacturer = await this.manufacturerService.findOne(manufacturerId)
        purchaseOrder.manufacturerId = manufacturerId
        purchaseOrder.manufacturer = manufacturer.name
      }

      // if products updated
      if (products.length > 0){
        // iterate through each product
        purchaseOrder.subTotal = await this.productsCost(products, purchaseOrder.storeName)
        purchaseOrder.products = products
        purchaseOrder.totalItems = purchaseOrder.products.length
        purchaseOrder.orderTotal = +(+purchaseOrder.subTotal - (+purchaseOrder.subTotal * +purchaseOrder.extraDiscount)).toFixed(2)
      }else{
        purchaseOrder.subTotal = 0
        purchaseOrder.products = []
        purchaseOrder.totalItems = 0
        purchaseOrder.orderTotal = 0

      }

      // if extraDiscount
      if (extraDiscount){
        // valid extraDiscount
        await this.validEntry('Discount',extraDiscount)
        purchaseOrder.extraDiscount = extraDiscount  
        purchaseOrder.orderTotal = +(+purchaseOrder.subTotal - (+purchaseOrder.subTotal * +purchaseOrder.extraDiscount)).toFixed(2)
      }

      // updatedBy
      purchaseOrder.updatedBy = req.user.username
      purchaseOrder.updatedById = req.user._id
      purchaseOrder.updatedByRole = req.user.role
      purchaseOrder.updatedAt =  new Date()

      // save changes
      await purchaseOrder.save()
      return
    } catch (error) {
      throw error
    }
  }

  async reject(req, id){
    try {

      // if purchase order exists
      const purchaseOrder = await this.purchaseOrderExists(req, id)

      // if not in pending status
      if (purchaseOrder.status !== "pending") throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)

      purchaseOrder.status = "rejected"
      await purchaseOrder.save()
      return

    } catch (error) {
      throw error
    }
  }

  async accept(req, id, acceptPurchaseOrderDto){
    try {
      const {products, extraDiscount, isPaid, expectedAt} = acceptPurchaseOrderDto

      // if no products
      if (products.length == 0) throw new HttpException('Products are required', HttpStatus.BAD_REQUEST)

      // if purchase order exists
      const purchaseOrder = await this.purchaseOrderExists(req, id)

      // if store subadmin doesn't exist - error
      const store = await this.storeService.findName(purchaseOrder.storeName)
      if (store.subAdmins.length === 0) throw new HttpException('Assign subadmin to store', HttpStatus.FORBIDDEN)

      // if not in pending status
      // if (purchaseOrder.status !== "pending") throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)

      // iterate through each product
      purchaseOrder.subTotal = await this.productsCost(products, purchaseOrder.storeName)
      purchaseOrder.products = products
      purchaseOrder.totalItems = purchaseOrder.products.length
      purchaseOrder.orderTotal = +(+purchaseOrder.subTotal - (+purchaseOrder.subTotal * +purchaseOrder.extraDiscount)).toFixed(2)

      // if extraDiscount
      if (extraDiscount){
        // valid extraDiscount
        await this.validEntry('Discount',extraDiscount)
        purchaseOrder.extraDiscount = extraDiscount  
        purchaseOrder.orderTotal = +(+purchaseOrder.subTotal - (+purchaseOrder.subTotal * +purchaseOrder.extraDiscount)).toFixed(2)
      }

      // change status
      purchaseOrder.status = 'accepted'

      // boughtBy
      purchaseOrder.boughtBy = req.user.username
      purchaseOrder.boughtById = req.user._id
      purchaseOrder.boughtByRole = req.user.role
      purchaseOrder.boughtAt =  new Date()
      // console.log(purchaseOrder)

      // Create product
      let productIds = []
      // iterate through each product and create while making 2 different obj for productDetails and productPurchaseDetails
      for (let i = 0; i < purchaseOrder.products.length; i++) {
        const product = purchaseOrder.products[i];

        // productPurchaseDetailsDto
        let productPurchaseDetailsDto = {}
        const costDetails = ['Rate_Unit', 'quantity', 'totalValue', 'discount', 'discountedPrice', 'GST', 'GSTValue', 'costPrice']
        for (let ind = 0; ind < costDetails.length; ind++) {
          productPurchaseDetailsDto[costDetails[ind]] = product[costDetails[ind]]
        }
        // set manufacturer, purchaseOderNo
        productPurchaseDetailsDto["purchaseOrderNo"] = purchaseOrder.purchaseOrderNo
        productPurchaseDetailsDto["manufacturerId"] = purchaseOrder.manufacturerId
        // get manufacturer name and set
        const manufacturer = await this.manufacturerService.findOne(purchaseOrder.manufacturerId)
        productPurchaseDetailsDto["manufacturer"] = manufacturer.name
        // if paid
        if (isPaid){
          productPurchaseDetailsDto["paymentStatus"] = 'paid'
          productPurchaseDetailsDto["amountPaid"] = productPurchaseDetailsDto["costPrice"]
        }
        // expected delivery at
        if (expectedAt){
          productPurchaseDetailsDto["expectedAt"] = new Date(expectedAt)
        }

        // productDetailsDto
        let productDetailsDto = {}
        const prodDetails = ["productName", "description", "brand", "category"]
        for (let ind = 0; ind < prodDetails.length; ind++) {
          if (product[prodDetails[ind]]) productDetailsDto[prodDetails[ind]] = product[prodDetails[ind]]
        }
        productDetailsDto["storeName"] = purchaseOrder.storeName
        productDetailsDto["storeId"] = purchaseOrder.storeId

        // console.log(productPurchaseDetailsDto, productDetailsDto)

        // create product entry
        const productTestingDetailsDto = {}
        const productSellDetailsDto = {}
        const passed = true
        let obj = { productDetailsDto, productPurchaseDetailsDto, productTestingDetailsDto, productSellDetailsDto, passed }
        const newProduct = await this.productService.create(req, obj)
        productIds.push(newProduct._id)
      }

      // add into manufacturer history
      await this.manufacturerService.addInHistory(purchaseOrder, productIds)

      // add product count to 'ordered' stage
      await this.stagesService.addProducts(purchaseOrder.storeName, 'ordered',  purchaseOrder.products.length)

      // add into time's income
      const month = new Date().getMonth()
      const year = new Date().getFullYear()
      await this.timeService.addExpense(purchaseOrder.storeName, month, year, purchaseOrder.orderTotal)

      // save purchase order
      await purchaseOrder.save()
      return

    } catch (error) {
      throw error
    }
  }

  
  async exportData(req, allPurchaseOrderDto, res){
    try {
      const purchaseOrders = await this.findAll(req, allPurchaseOrderDto, '1', `${Number.MAX_SAFE_INTEGER}`)
      const fields = purchaseOrderFields

      const parser = new Parser({
        fields
      })

      const json = []
      let purchaseOrderObj = {}
      purchaseOrders.forEach(purchaseOrder => {
        for (let index = 0; index < fields.length; index++) {
          purchaseOrderObj[fields[index]] = purchaseOrder[fields[index]] || null          
        }
        json.push({...purchaseOrderObj})
      })

      const csv = parser.parse(json)
      res.header('Content-Type', 'text/csv')
      res.attachment('purchaseOrders.csv')
      return res.send(csv)

    } catch (error) {
      throw error
    }
  }

}
