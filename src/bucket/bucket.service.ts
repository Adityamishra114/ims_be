import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BucketInterface } from './interface/bucket.interface';
import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { CustomerService } from 'src/customer/customer.service';
import { InvoiceService } from 'src/invoice/invoice.service';
import { ProductTestingService } from 'src/product-testing/product-testing.service';
import { ProductSellService } from 'src/product-sell/product-sell.service';
import { ProductPurchaseService } from 'src/product-purchase/product-purchase.service';
import { StagesService } from 'src/stages/stages.service';

@Injectable()
export class BucketService {

  constructor(@InjectModel('Bucket') private readonly bucketModel: Model<BucketInterface>,
  @Inject(forwardRef(() => ProductService)) private readonly productsService: ProductService,
  @Inject(forwardRef(() => ProductPurchaseService)) private readonly productPurchaseService: ProductPurchaseService,
  @Inject(forwardRef(() => ProductTestingService)) private readonly productTestingService: ProductTestingService,
  @Inject(forwardRef(() => ProductSellService)) private readonly productSellService: ProductSellService,
  @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
  @Inject(forwardRef(() => CustomerService)) private readonly customerService: CustomerService,
  @Inject(forwardRef(() => InvoiceService)) private readonly invoiceService: InvoiceService,
  @Inject(forwardRef(() => StagesService)) private readonly stagesService: StagesService
  ){}


  async create(req, productId, storeName) {
    try {

      // get product
      const product = await this.productsService.findId(req, productId)
      const productPurchase = await this.productPurchaseService.findOne(productId)
      const productTesting = await this.productTestingService.findOne(productId)
      const productSell = await this.productSellService.findOne(productId)
      if (!productSell.sellingPrice) return productId

      // add sellingGST
      productSell.sellingGST = productPurchase.GST

      //  if already added in any bucket
      if (productTesting.bucketId) throw new HttpException('Product is already added in cart', HttpStatus.CONFLICT)

      // if not ready to sell
      if (product.status !== "completed") throw new HttpException('Product is not ready to sell', HttpStatus.BAD_REQUEST)

      // find if bucket of logged in user exists -> if not make one
      let bucket
      bucket = await this.bucketModel.findOne({username: req.user.username})
      if (!bucket){
        const bucketDetails = {
          userId: req.user._id.toString(),
          username: req.user.username
        }
        bucket = new this.bucketModel(bucketDetails)
      } 
      if (bucket.storeName && bucket.storeName != storeName) throw new HttpException(`Checkout products of ${bucket.storeName} before adding products of ${storeName}`, HttpStatus.FORBIDDEN)

      // make an object of new product detail
      let obj = {productId}
      const properties = ["productName", "description", "brand", "category"];
      properties.forEach(prop => {
        obj[prop] = product[prop]
      });

      // product selling details
      const sellProperties = ["sellingGST", "sellingPrice", "discount"]
      sellProperties.forEach(prop => {
        obj[prop] = productSell[prop]
      });

      // add bucketId to product
      product.bucketId = bucket._id.toString()
      product.bucket = req.user.username

      // change values according to quantity
      if (productSell.discount){
        const discounted = +(+obj["discount"] * +obj["sellingPrice"]).toFixed(2)
        obj["discountedPrice"] =  +(obj["sellingPrice"] - discounted).toFixed(2)
        obj["GSTValue"] = +(+obj["sellingGST"] * obj["discountedPrice"]).toFixed(2)
        obj["sellingAt"] = +(+obj["GSTValue"] + +obj["discountedPrice"]).toFixed(2)
      }else{
        obj["GSTValue"] = +(+obj["sellingGST"] * +obj["sellingPrice"]).toFixed(2)
        obj["sellingAt"] = +(+obj["GSTValue"] + +obj["sellingPrice"]).toFixed(2)
      }

      bucket.products.push(obj)
      bucket.totalItems = bucket.products.length
      bucket.subTotal += +obj["sellingAt"]
      if (bucket.extraDiscount){
        const discounted = +(bucket.subTotal * bucket.extraDiscount).toFixed(2)
        bucket.orderTotal = +(bucket.subTotal - discounted).toFixed(2)
      }else{
        bucket.orderTotal = bucket.subTotal
      }
      if (!bucket.storeName) {
        bucket.storeName = storeName
      }

      await bucket.save()
      await product.save()
      await productSell.save()
      return

    } catch (error) {
      throw error
    }
  }

  async findOne(req) {
    try {
      const bucket = await this.bucketModel.findOne({
        username: req.user.username
      })
      return bucket
    } catch (error) {
      throw error
    }
  }

  async productExists(productId, products){
    try {
      const ans =  products.some(obj => obj.productId == productId)
      return ans
    } catch (error) {
      throw error
    }
  }

  async updateQnt(req, id, extraDiscount){
    try {
      let bucket = await this.bucketModel.findOne({
        _id: id,
        username: req.user.username
      })
      if (!bucket) throw new HttpException('Bucket not found', HttpStatus.NOT_FOUND)
      
      // valid extraDiscount
      const invalidLength = extraDiscount.length > 5
      const validValue = extraDiscount >= 0 && extraDiscount <= 1
      if (!validValue || invalidLength) throw new HttpException(`Discount ${+extraDiscount * 100}: Invalid entry`, HttpStatus.BAD_REQUEST)

      bucket.extraDiscount = +extraDiscount
      const discounted = +(bucket.extraDiscount * bucket.subTotal).toFixed(2)
      bucket.orderTotal = +(bucket.subTotal - discounted).toFixed(2)

      console.log(bucket)
      await bucket.save()

      return

    } catch (error) {
      throw error
    }
  }

  async removeProduct(req, id){
    try {
      // get bucket id
      const product = await this.productsService.findId(req, id)
      const bucket = await this.bucketModel.findOne({_id : product.bucketId, username: req.user.username})
      if (!bucket) throw new HttpException('Bucket not found', HttpStatus.NOT_FOUND)
      await this.productsService.removeFromBucket(id)

      const initialVal = []
      let removeTotal = 0
      const updatedProducts = bucket.products.reduce((acc, curr) => {
        if (curr.productId == id){
          removeTotal = curr.sellingAt
        }else{
          acc.push(curr)
        }
        return acc
      }, initialVal)

      bucket.products = updatedProducts
      bucket.subTotal -= removeTotal
      bucket.totalItems -= 1
      const discounted = +(bucket.extraDiscount * bucket.subTotal).toFixed(2)
      bucket.orderTotal = +(bucket.subTotal - discounted).toFixed(2)
      
      // if products are not present remove storeName
      if (bucket.products.length == 0){
        bucket.storeName = null
      }

      await bucket.save()

      return

    } catch (error) {
      throw error
    }
  }

  async sellProduct(req, id, details){
    try {

      // get bucket
      const bucket = await this.bucketModel.findOne({_id: id})
      if (!bucket) throw new HttpException('Bucket not found', HttpStatus.NOT_FOUND)

      // make an array of productIds
      const products = []
      bucket.products.forEach(product => products.push(product.productId))
      // console.log(products)

      // get customer - if exists, else make new one
      let customer
      customer = await this.customerService.findEmail(details.email)
      if (customer && customer.name !== details.name) throw new HttpException('Invalid Entry', HttpStatus.BAD_REQUEST)
      if (!customer){
        customer = await this.customerService.create(req, details)
      }
      // console.log(customer)

      // common object
      let obj = {
        storeName: bucket.storeName,
        totalItems: bucket.totalItems,
        subTotal: bucket.subTotal,
        extraDiscount: bucket.extraDiscount,
        orderTotal: bucket.orderTotal,
        soldBy: req.user.username,
        soldById: req.user._id,
        soldByRole: req.user.role,
      }

      // generate invoice - save it
      let invoiceObj = {
        customerId: customer._id,
        productIds: products
      }
      invoiceObj = {...invoiceObj, ...obj}
      const invoice = await this.invoiceService.create(invoiceObj)

      // loop through bucket.products and add them in customer as well as make changes in each product
      // totalPurchal changes and purchasingHistory changes in customer
      
      let customerObj = {
        invoiceNo: invoice.invoiceNo,
        invoiceId: invoice._id,
        products: []
      }
      customer.totalPurchaseVal += obj.orderTotal
      customer.totalPurchase += obj.totalItems
      customerObj = {...customerObj, ...obj}
      
      await Promise.all(bucket.products.map(async product => {
        customerObj.products.push(product)

        let productObj = {
          invoiceId: invoice._id,
          invoiceNo: invoice.invoiceNo,
          customerId: customer._id,
          soldBy: req.user.username,
          soldById: req.user._id,
          soldByRole: req.user.role,
          soldAt: Date.now(),
          sellingGST: product.GST,
          sellingGSTValue: product.GSTValue,
          discount: product.discount,
          discountedPrice: product.discountedPrice,
          sellingAt: product.sellingAt
        }

        await this.productsService.sellProduct(product.productId)
        await this.productsService.removeFromBucket(product.productId)
        await this.productSellService.sellProduct(product.productId, productObj)
      }))
      
      customer.purchaseHistory.push(customerObj)
      await customer.save()
      
      // remove product count from 'completed' stage
      await this.stagesService.removeProducts(bucket.storeName, 'completed', bucket.products.length)

      // add product count to 'soldOut' stage
      await this.stagesService.addProducts(bucket.storeName, 'soldOut', bucket.products.length)


      // delete bucket
      await this.bucketModel.findByIdAndDelete(id)

      return 

    } catch (error) {
      throw error
    }
  }


}
