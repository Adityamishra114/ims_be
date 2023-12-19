import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialsDto } from './dto/createMaterials.dto';
import { UpdateMaterialsDto } from './dto/updateMaterials.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorator/auth.decorator';

@Controller('materials')
@UseGuards(RolesGuard)
// Admin and subadmin only
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // create
  @Post('create')
  @Roles('admin', 'subadmin')
  async create(@Res() res, @Req() req, @Body() createMaterialsDto: CreateMaterialsDto){
    try {
      await this.materialsService.create(req, createMaterialsDto)
      res.status(HttpStatus.CREATED).json('Raw material entry has been created sucessfully')
    } catch (error) {
      throw error
    }
  }
  
  // add material
  @Post('add')
  @Roles('admin', 'subadmin')
  async add(@Res() res, @Req() req, @Body('name') name: String, @Body('quantity') quantity: String, @Body('storeName') storeName: String = ''){
    try {
      await this.materialsService.add(req, name, quantity, storeName)
      res.status(HttpStatus.CREATED).json('Raw material has been added sucessfully')
    } catch (error) {
      throw error
    }
  }
  
  // read all
  @Post('allmaterials')
  @Roles('admin', 'subadmin')
  async findAll(@Res() res, @Req() req, @Body('filter') filter: Object){
    try {
      const materials = await this.materialsService.findAll(req, filter)
      res.status(HttpStatus.OK).json(materials)
    } catch (error) {
      throw error
    }
  }

  // read one
  @Get(':id')
  @Roles('admin', 'subadmin')
  async findOne(@Res() res, @Req() req, @Param('id') id: String){
    try {
      const material = await this.materialsService.findOne(req, id)
      res.status(HttpStatus.OK).json(material)
    } catch (error) {
      throw error
    }
  }

  // update
  @Post(':id')
  @Roles('admin', 'subadmin')
  async update(@Res() res, @Req() req, @Param('id') id: String, @Body() updateMaterialsDto: UpdateMaterialsDto){
    try {
      await this.materialsService.update(req, id, updateMaterialsDto)
      res.status(HttpStatus.OK).json('Raw material entry has been updated sucessfully')
    } catch (error) {
      throw error
    }
  } 
  // dropdown
  @Get('allmaterials/dropdown')
  async allmaterials(@Res() res, @Req() req,){
    try {
      const materials = await this.materialsService.allmaterials(req)
      res.status(HttpStatus.OK).json(materials)
    } catch (error) {
      throw error
    }
  }

}
