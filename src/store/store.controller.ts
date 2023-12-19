import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { RolesGuard } from 'src/auth/auth.guard';

@Controller('store')
@UseGuards(RolesGuard)

export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // Only admin access
  @Post('create')
  @Roles('admin')
  async create(@Res() res, @Req() req, @Body() createStoreDto: CreateStoreDto) {
    try {
      const store = await this.storeService.create(req, createStoreDto)
      res.status(HttpStatus.CREATED).json('Store has been created successfully')
      
    } catch (error) {
      throw error
    }
  }

  // Only admin access
  @Post('allstores')
  @Roles('admin')
  async findAll(@Res() res, @Req() req, @Body('filter') filter: Object) {
    try {
      const stores = await this.storeService.findAll(filter);
      res.status(HttpStatus.OK).json(stores)
      
    } catch (error) {
      throw error
    }
  }

  // Only admin access
  @Get(':id')
  @Roles('admin')
  async findOne(@Res() res, @Req() req, @Param('id') id: String) {
    try {
      const store = await this.storeService.findOne(id);
      res.status(HttpStatus.OK).json(store)
      
    } catch (error) {
      throw error
    }
  }

  // Only admin access
  @Post(':id')
  @Roles('admin')
  async update(@Res() res, @Req() req, @Param('id') id: String, @Body() updateStoreDto: UpdateStoreDto) {
    try {
      await this.storeService.update(req, id, updateStoreDto);
      res.status(HttpStatus.OK).json('Store has been updated')
    } catch (error) {
      throw error
    }
  }

  //Dropdown
  @Get('allStores/dropdown')
  async allStores(@Res() res, @Req() req){
    try {
      const stores = await this.storeService.allStores(req)
      res.status(HttpStatus.OK).json(stores)
    } catch (error) {
      throw error
    }
  }

}
