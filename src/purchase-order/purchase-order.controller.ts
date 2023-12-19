import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus, UseGuards, HttpException, Query } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { RolesGuard } from 'src/auth/auth.guard';
import { AllPurchaseOrderDto } from './dto/allPurchaseOrder.dto';
import { AcceptPurchaseOrderDto } from './dto/acceptPurchaseOrder.dto';

@Controller('purchase-order')
@UseGuards(RolesGuard)
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  // Only admin and subadmin access
  @Post('create')
  @Roles('admin', 'subadmin')
  async create(@Res() res, @Req() req, @Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    try {
      const po = await this.purchaseOrderService.create(req, createPurchaseOrderDto);
      res.status(HttpStatus.CREATED).json(`Purchase order ${po.purchaseOrderNo} has been created successfully`)
    } catch (error) {
      throw error
    }
  }

  // Only admin and subadmin access
  @Post('allpurchaseOrders')
  @Roles('admin', 'subadmin')
  async findAll(@Res() res, @Req() req, @Body() allPurchaseOrderDto: AllPurchaseOrderDto, @Query('page') page: String = '1', @Query('limit') limit: String = `${Number.MAX_SAFE_INTEGER}` ) {
    try {
      const purchaseOrders = await this.purchaseOrderService.findAll(req, allPurchaseOrderDto, page, limit);
      res.status(HttpStatus.OK).json(purchaseOrders)
    } catch (error) {
      throw error
    }
  }

  // Only admin and subadmin access
  @Get(':id')
  @Roles('admin', 'subadmin')
  async findOne(@Req() req, @Res() res, @Param('id') id: string) {
    try {
      const purchaseOrder = await this.purchaseOrderService.findOne(req, id);
      res.status(HttpStatus.OK).json(purchaseOrder)
    } catch (error) {
      throw error
    }
  }

  // Only admin and subadmin access
  @Post('update/:id')
  @Roles('admin', 'subadmin')
  async update(@Req() req, @Res() res, @Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    try {
      await this.purchaseOrderService.update(req, id, updatePurchaseOrderDto);
      res.status(HttpStatus.OK).json('Purchase order has been updated successfully')
    } catch (error) {
      throw error
    }
  }

  // reject
  @Post('reject/:id')
  @Roles('admin', 'subadmin')
  async reject(@Req() req, @Res() res, @Param('id') id: string) {
    try {
      await this.purchaseOrderService.reject(req, id);
      res.status(HttpStatus.OK).json('Purchase order has been rejected successfully')
    } catch (error) {
      throw error
    }
  }

  // accept
  @Post('accept/:id')
  @Roles('admin', 'subadmin')
  async accept(@Req() req, @Res() res, @Param('id') id: string, @Body() acceptPurchaseOrderDto: AcceptPurchaseOrderDto) {
    try {
      await this.purchaseOrderService.accept(req, id, acceptPurchaseOrderDto);
      res.status(HttpStatus.OK).json('Purchase order has been accepted successfully')
    } catch (error) {
      throw error
    }
  }

  // export
  @Post('export/data')
  async export(@Res() res, @Req() req, @Body() allPurchaseOrderDto: AllPurchaseOrderDto){
    try {
      await this.purchaseOrderService.exportData(req, allPurchaseOrderDto, res)
      return
    } catch (error) {
      throw error
    }
  }

}
