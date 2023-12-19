import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateProductPurchaseDto } from './dto/create-product-purchase.dto';
import { UpdateProductPurchaseDto } from './dto/update-product-purchase.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductPuchaseInterface } from './interface/productPurchase.interface';
import { ProductService } from 'src/product/product.service';
import { StagesService } from 'src/stages/stages.service';

@Injectable()
export class ProductPurchaseService {

  constructor(@InjectModel('ProductPurchase') private readonly productPurchaseModel: Model<ProductPuchaseInterface>,
  @Inject(forwardRef(() => ProductService))private readonly productService: ProductService,
  @Inject(forwardRef(() => StagesService))private readonly stagesService: StagesService,){}
  
   // used in bucket
   async findOne(prodId){
    try {
      const productPurchase = await this.productPurchaseModel.findOne({prodId})
      if (!productPurchase) throw new HttpException('Product not found', HttpStatus.BAD_REQUEST)
      return productPurchase
    } catch (error) {
      throw error
    }
  }

  async create(createProductPurchaseDto) {
    try {
      const productPurchase = new this.productPurchaseModel(createProductPurchaseDto)
      // console.log(productPurchase)
      await productPurchase.save()
      return productPurchase

    } catch (error) {
      throw error
    }
  }
  
  async update(id, updateProductPurchaseDto) {
    try {
      await this.productPurchaseModel.findOneAndUpdate(
        {prodId: id},
        updateProductPurchaseDto,
        {new: true}
      )
      return
    } catch (error) {
      throw error
    }
  }

  async remove(id) {
    try {
      await this.productPurchaseModel.findOneAndDelete(
        {prodId: id},
      )
      return
    } catch (error) {
      throw error
    }
  }

  async paymentStatus(req, id, paymentStatus, amountPaid){
    try {

      // whether product exists
      let product = await this.productService.findId(req, id)

      // get productPurchase
      let productPurchase = await this.productPurchaseModel.findOne({prodId: product._id})

      // set amountPaid based on payment status
      if (paymentStatus === 'paid'){
        if (productPurchase.paymentStatus === 'paid') return
        productPurchase.amountPaid = productPurchase.costPrice
        productPurchase.paidBy = req.user.username
        productPurchase.paidById = req.user._id
        productPurchase.paidByRole = req.user.role
        productPurchase.paidAt = new Date()
      }else if (paymentStatus === 'unpaid'){
        if (productPurchase.paymentStatus === 'unpaid') return
        productPurchase.amountPaid = 0
        productPurchase.paidBy = null
        productPurchase.paidById = null
        productPurchase.paidByRole = null
        productPurchase.paidAt = null
      }else {
        if (productPurchase.paymentStatus === 'partially paid') return
        if (productPurchase.costPrice < +amountPaid) {
          return product.productId
        }
        productPurchase.amountPaid = amountPaid
        productPurchase.paidBy = req.user.username
        productPurchase.paidById = req.user._id
        productPurchase.paidByRole = req.user.role
        productPurchase.paidAt = new Date()
      } 
      productPurchase.paymentStatus = paymentStatus
      
      await productPurchase.save()
      return

    } catch (error) {
      throw error
    }
  }

  async received(req, id, barcodeId){
    try {

      // whether product exists
      const product = await this.productService.findId(req, id)

      // whether duplicate barcodeId
      await this.productService.duplicate(barcodeId)

      // if product already received
      if (product.status === 'received') throw new HttpException('Product has already been received', HttpStatus.BAD_REQUEST)

      product.status = 'received'
      product.barcodeId = barcodeId
      
      // remove product count from 'ordered' stage
      await this.stagesService.removeProducts(product.storeName, 'ordered',  1)
      
      // add product count to 'received' stage
      await this.stagesService.addProducts(product.storeName, 'received',  1)

      await product.save()
      return
      
    } catch (error) {
      throw error
    }
  }

  async moveToTesting(req, id){
    try {

      // whether product exists
      const product = await this.productService.findId(req, id)

      // if barcodeId doesn't exist
      if (!product.barcodeId){
        return product.productId
      }

      // if product hasn't been received
      if (product.status !== 'received') return product.productId

      product.status = "new"

      // find product purchase and make changes
      const productPurchase = await this.productPurchaseModel.findOne({prodId: id})

      productPurchase["closedBy"] = req.user.username
      productPurchase["closedById"] = req.user._id
      productPurchase["closedByRole"] = req.user.role
      productPurchase["closedAt"] = new Date()

      // remove product count from 'received' stage
      await this.stagesService.removeProducts(product.storeName, 'received',  1)

      // add product count to 'new' stage
      await this.stagesService.addProducts(product.storeName, 'new',  1)

      // save changes
      await product.save()
      await productPurchase.save()

      return null
    } catch (error) {
      throw error
    }
  }

  
}
