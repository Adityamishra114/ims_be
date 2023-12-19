import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import {  UpdateQntDto } from './dto/update-bucket.dto';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { RolesGuard } from 'src/auth/auth.guard';
import { Details } from './dto/Details.dto';

@Controller('bucket')
@UseGuards(RolesGuard)
// Only subadmin and admin access
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Post('add')
  @Roles('admin', 'subadmin')
  async create(@Req() req, @Res() res, @Body() createBucketDto: CreateBucketDto) {
    try {
      const {ids} = createBucketDto
      let productIds = []
      for (let i = 0; i < ids.length; i++) {
        const productId = await this.bucketService.create(req, ids[i], createBucketDto.storeName);
        if (productId){
          productIds.push(productId)
        }
      }
      if (productIds.length === 0){
        res.status(HttpStatus.OK).json("Products have been added to cart")
      }else{
        res.status(HttpStatus.BAD_REQUEST).json(`Products of ProductIds: ${productIds} require selling price per unit`)
      }
    } catch (error) {
      throw error
    }
  }


  @Get()
  @Roles('admin', 'subadmin')
  async findOne(@Req() req, @Res() res) {
    try {
      const bucket = await this.bucketService.findOne(req);
      res.status(HttpStatus.OK).json(bucket)
    } catch (error) {
      throw error
    }
  }

  @Post('update/:id')
  @Roles('admin', 'subadmin')
  async updateQnt(@Req() req, @Res() res, @Param('id') id: String, @Body('extraDiscount') extraDiscount: String){
    try {
      const bucket = await this.bucketService.updateQnt(req, id, extraDiscount)
      res.status(HttpStatus.OK).json('Bucket has been saved successfully')
    } catch (error) {
      throw error
    }
  }
  
  // remove product from bucket - passing product id
  @Post('remove/:id')
  @Roles('admin', 'subadmin')
  async removeProduct(@Req() req, @Res() res, @Param('id') id: String){
    try {
      const bucket = await this.bucketService.removeProduct(req, id)
      res.status(HttpStatus.OK).json('Product has been removed from bucket successfully')
    } catch (error) {
      throw error
    }
  }


  @Post('checkout/:id')
  @Roles('admin', 'subadmin')
  async sellProducts(@Req() req, @Res() res, @Param('id') id: String, @Body() details: Details){
    try {
      await this.bucketService.sellProduct(req, id, details)
      res.status(HttpStatus.OK).json('Products are sold successfully')
    } catch (error) {
      throw error
    }
  }
  
}
