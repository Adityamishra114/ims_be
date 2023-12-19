import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { AllCustomersDto } from './dto/allCustomers.dto';

@Controller('customer')
@UseGuards(RolesGuard)
// admin, subadmin only
export class CustomerController {
    constructor(private readonly customerService: CustomerService){}

    @Post('create')
    @Roles('admin', 'subadmin')
    async create(@Req() req, @Res() res, @Body() createCustomerDto: CreateCustomerDto){
        try {
            await this.customerService.create(req, createCustomerDto)
            res.status(HttpStatus.CREATED).json('Customer has been created successfully')
        } catch (error) {
            throw error
        }
    }

    @Post('allcustomers')
    @Roles('admin', 'subadmin')
    async findAll(@Res() res, @Req() req, @Body() allCustomersDto: AllCustomersDto, @Query('page') page: String = "1", @Query('limit') limit: number = Number.MAX_SAFE_INTEGER) {
      try {
        let customers = await this.customerService.findAll(req, allCustomersDto, page, limit)
        res.status(HttpStatus.OK).json(customers) 
        return
      } catch (error) {
        throw error
      }
    }

    @Get(':id')
    @Roles('admin', 'subadmin')
    async findId(@Req() req, @Res() res, @Param('id') id: String){
        try {
            const customer = await this.customerService.findId(req, id)
            res.status(HttpStatus.OK).json(customer)
        } catch (error) {
            throw error
        }
    }

    @Post('invoices/:id')
    @Roles('admin', 'subadmin')
    async findInvoice(@Req() req, @Res() res, @Param('id') id: String, @Body('filters') filters: Array<Object> = []){
        try {
            const customer = await this.customerService.findInvoice(req, id, filters)
            res.status(HttpStatus.OK).json(customer)
        } catch (error) {
            throw error
        }
    }

    @Post('products/:id')
    @Roles('admin', 'subadmin')
    async findProducts(@Req() req, @Res() res, @Param('id') id: String, @Body('invoiceId') invoiceId: String, @Body('filters') filters: Array<Object> = []){
        try {
            const customer = await this.customerService.findProducts(req, id, invoiceId, filters)
            res.status(HttpStatus.OK).json(customer)
        } catch (error) {
            throw error
        }
    }


    @Post(':id')
    @Roles('admin', 'subadmin')
    async update(@Res() res, @Req() req,@Param('id') id: String, @Body() UpdateCustomerDto: UpdateCustomerDto) {
      try {
        await this.customerService.update(req, id, UpdateCustomerDto)
        res.status(HttpStatus.OK).json('Customer has been updateed successfully') 
      } catch (error) {
        throw error
      }
    }

    // dropdown
    @Get('allCustomers/dropdown')
    async allCusomers(@Req() req, @Res() res){
        try {
            const customers = await this.customerService.allCustomers()
            res.status(HttpStatus.OK).json(customers) 
        } catch (error) {
            throw error
        }
    }

    
}
