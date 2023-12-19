import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, HttpStatus, Query } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { AllManufacturersDto } from './dto/allManufacturers.dto';

@Controller('manufacturer')
@UseGuards(RolesGuard)
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Post('create')
  @Roles('admin', 'subadmin')
  async create(@Req() req, @Res() res, @Body() createManufacturerDto: CreateManufacturerDto) {
    try {
      // console.log(createManufacturerDto)
      await this.manufacturerService.create(req, createManufacturerDto);
      res.status(HttpStatus.CREATED).json('Manufacturer has been created successfully')
    } catch (error) {
      throw error
    }
  }

  @Post('allmanufacturers')
  @Roles('admin', 'subadmin')
  async findAll(@Res() res, @Req() req, @Body() allManufacturersDto: AllManufacturersDto, @Query('page') page: String = "1", @Query('limit') limit: number = Number.MAX_SAFE_INTEGER) {
    try {
      let manufacturers = await this.manufacturerService.findAll(req, allManufacturersDto, page, limit)
      res.status(HttpStatus.OK).json(manufacturers) 
      return
    } catch (error) {
      throw error
    }
  }

  @Get(':id')
  @Roles('admin', 'subadmin')
  async findId(@Req() req, @Res() res, @Param('id') id: string) {
    try {
      const manufacturer = await this.manufacturerService.findId(req, id);
      res.status(HttpStatus.OK).json(manufacturer)
    } catch (error) {
      throw error
    }
  }

  @Post('purchaseOrders/:id')
  @Roles('admin', 'subadmin')
  async findPurchaseOrders(@Req() req, @Res() res, @Param('id') id: String, @Body('filters') filters: Array<Object> = []){
      try {
          const customer = await this.manufacturerService.findPurchaseOrders(req, id, filters)
          res.status(HttpStatus.OK).json(customer)
      } catch (error) {
          throw error
      }
  }

  @Post('products/:id')
  @Roles('admin', 'subadmin')
  async findProducts(@Req() req, @Res() res, @Param('id') id: String, @Body('purchaseOrderId') purchaseOrderId: String, @Body('filters') filters: Array<Object> = []){
      try {
          const customer = await this.manufacturerService.findProducts(req, id, purchaseOrderId, filters)
          res.status(HttpStatus.OK).json(customer)
      } catch (error) {
          throw error
      }
    }

  @Post(':id')
  @Roles('admin', 'subadmin')
  async update(@Res() res, @Req() req,@Param('id') id: String, @Body() updateManufacturerDto: UpdateManufacturerDto) {
    try {
      await this.manufacturerService.update(req, id, updateManufacturerDto);
      res.status(HttpStatus.OK).json('Customer has been updateed successfully') 
    } catch (error) {
      throw error
    }
  }

  // dropdown
  @Get('allManufacturers/dropdown')
  async allManufacturers(@Req() req, @Res() res){
    try {
      const manufacturers = await this.manufacturerService.allManufacturers(req)
      res.status(HttpStatus.OK).json(manufacturers)
    } catch (error) {
      throw error
    }
  }

}
