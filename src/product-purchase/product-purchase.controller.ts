import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Query, HttpStatus, UseGuards, HttpException, Inject, forwardRef } from '@nestjs/common';
import { ProductPurchaseService } from './product-purchase.service';
import { CreateProductPurchaseDto } from './dto/create-product-purchase.dto';
import { UpdateProductPurchaseDto } from './dto/update-product-purchase.dto';
import { AllProductsDto } from 'src/product/dto/allProducts.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { StagesService } from 'src/stages/stages.service';

@Controller('product-purchase')
@UseGuards(RolesGuard)
export class ProductPurchaseController {
  constructor(private readonly productPurchaseService: ProductPurchaseService, 
    @Inject(forwardRef(() => StagesService))private readonly stagesService: StagesService,) {}

  // change payment status
  @Post('paymentStatus')
  @Roles('admin', 'subadmin')
  async paymentStatus(@Res() res, @Req() req, @Body('ids') ids: String[], @Body('paymentStatus') paymentStatus: string, @Body('amountPaid') amountPaid: String){
    if (paymentStatus === "partially paid" && !amountPaid) throw new HttpException('Amount paid is required', HttpStatus.BAD_REQUEST)
    const allowed = ['paid', 'unpaid', 'partially paid']
    if (!allowed.includes(paymentStatus)) throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
    try {
      let products = []
      for (let i = 0; i < ids.length; i++) {
        const productId = await this.productPurchaseService.paymentStatus(req, ids[i], paymentStatus, amountPaid);
        if (productId) products.push(productId)
      }
    if (products.length > 0){
      res.status(HttpStatus.BAD_REQUEST).json(`Amount paid for products ${products} exceed its cost price.`)
    }else{
      res.status(HttpStatus.OK).json('Products has been paid successfully')
    }
    } catch (error) {
      throw error
    }
  }

  // move to testing
  @Post('move')
  @Roles('admin', 'subadmin')
  async moveToTesting(@Res() res, @Req() req, @Body('ids') ids: String[]){
    try {
      let products = []
      for (let i = 0; i < ids.length; i++) {
        const productId = await this.productPurchaseService.moveToTesting(req, ids[i]);
        if (productId){
          products.push(productId)
        }
      }
      if (products.length === 0){
        res.status(HttpStatus.OK).json('Products has been moved to testing successfully')
      }else{
        res.status(HttpStatus.BAD_REQUEST).json(`Products of productIds ${products} can not be moved to testing`)
      }
    } catch (error) {
      throw error
    }
  }

  // ordered to received
  @Post('received/:id')
  @Roles('admin', 'subadmin')
  async received(@Res() res, @Req() req, @Param('id') id: String, @Body('barcodeId') barcodeId: String){
    try {
      await this.productPurchaseService.received(req, id, barcodeId)
      res.status(HttpStatus.OK).json('Product has been received successfully')
    } catch (error) {
      throw error
    }
  }


}
