import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus } from '@nestjs/common';
import { ProductTestingService } from './product-testing.service';
import { CreateProductTestingDto } from './dto/create-product-testing.dto';
import { UpdateProductTestingDto } from './dto/update-product-testing.dto';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { AssignEngineerDto } from 'src/product/dto/assign-engineer.dto';

@Controller('product-testing')
export class ProductTestingController {
  constructor(private readonly productTestingService: ProductTestingService) {}


}
