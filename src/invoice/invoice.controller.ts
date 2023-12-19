import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { RolesGuard } from 'src/auth/auth.guard';


@Controller('invoice')
@UseGuards(RolesGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('allinvoices')
  @Roles('admin', 'subadmin')
  async findAll(@Res() res, @Req() req, @Body('filter') filter: Object) {
    try {
      const invoices = await this.invoiceService.findAll(req, filter);
      res.status(HttpStatus.OK).json(invoices) 
    } catch (error) {
      throw error
    }
  }

  @Get(':id')
  @Roles('admin', 'subadmin')
  async findOne(@Req() req, @Res() res, @Param('id') id: string) {
    try {
      const invoice = await this.invoiceService.findOne(req, id);
      res.status(HttpStatus.OK).json(invoice)
    } catch (error) {
      throw error
    }
  }

  @Post('permission/:id')
  @Roles('admin')
  async permission(@Req() req, @Res() res, @Param('id') id: string){
    try {
      await this.invoiceService.permission(id, req)
      res.status(HttpStatus.OK).json('Confirmation mail has been sent to security')
    } catch (error) {
      throw error
    }
  }

}
