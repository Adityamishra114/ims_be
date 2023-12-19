import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductSellDto } from './dto/create-product-sell.dto';
import { UpdateProductSellDto } from './dto/update-product-sell.dto';
import { Model } from 'mongoose';
import { ProductSellInterface } from './interface/productSell.interface';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProductSellService {

  constructor(@InjectModel('ProductSell') private readonly productSellModel: Model<ProductSellInterface>){}

  // sell product changes, used in bucket
  async sellProduct(prodId, newProduct){
    try {
      const product = await this.productSellModel.findOneAndUpdate(
        {prodId},
        {$set: newProduct},
        {new:true} 
      )
      if (!product) throw new HttpException('Product not found', HttpStatus.NOT_FOUND)
      return product
    } catch (error) {
      throw error
    }
  }

  // used in bucket
  async findOne(prodId){
    try {
      const productSell = await this.productSellModel.findOne({prodId})
      if (!productSell) throw new HttpException('Product not found', HttpStatus.BAD_REQUEST)
      return productSell
    } catch (error) {
      throw error
    }
  }


  async create(createProductSellDto) {
    try {
      const productSell = new this.productSellModel(createProductSellDto)
      // console.log(productSell)
      await productSell.save()
      return productSell
      
    } catch (error) {
      throw error
    }
  }

  async update(id, updateProductSellDto) {
    try {
      console.log(updateProductSellDto)
      await this.productSellModel.findOneAndUpdate(
        {prodId: id},
        updateProductSellDto,
        {new: true}
      )
      return
    } catch (error) {
      throw error
    }
  }

  async remove(id) {
    try {
      await this.productSellModel.findOneAndDelete(
        {prodId: id},
      )
      return
    } catch (error) {
      throw error
    }
  }
}
