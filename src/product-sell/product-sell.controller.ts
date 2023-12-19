import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductSellService } from './product-sell.service';
import { CreateProductSellDto } from './dto/create-product-sell.dto';
import { UpdateProductSellDto } from './dto/update-product-sell.dto';

@Controller('product-sell')
export class ProductSellController {
  constructor(private readonly productSellService: ProductSellService) {}


}
