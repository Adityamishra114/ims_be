import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus, UseGuards, UseInterceptors, UploadedFiles, ParseFilePipeBuilder, HttpException, Inject, forwardRef } from '@nestjs/common';
import { CatPhaseService } from './cat-phase.service';
import { CreateCatPhaseDto } from './dto/create-cat-phase.dto';
import { UpdateCatPhaseDto } from './dto/update-cat-phase.dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs'
import { StoreService } from 'src/store/store.service';

@Controller('cat-phase')
@UseGuards(RolesGuard)
export class CatPhaseController {
  constructor(@Inject(forwardRef(() => StoreService))private readonly storeService: StoreService,
  private readonly catPhaseService: CatPhaseService) {}

  // Only admin access
  @Post('create')
  @Roles('subadmin','admin')
  async create(@Res() res, @Req() req, @Body() createCatPhaseDto: CreateCatPhaseDto) {
    try {
      const cat = await this.catPhaseService.create(req, createCatPhaseDto);
      res.status(HttpStatus.CREATED).json('Category has been created successfully')
    } catch (error) {
      throw error
    }
  }

  // Only admin, subadmin access
  @Post('allcategories')
  @Roles('admin', 'subadmin')
  async findAll(@Res() res, @Req() req, @Body('filter') filter: Object, @Body('storeName') storeName: String = '') {
    try {
      const cats = await this.catPhaseService.findAll(req, filter, storeName);
      res.status(HttpStatus.OK).json(cats)
    } catch (error) {
      throw error
    }
  }

  // Only admin, subadmin access
  @Get(':id')
  @Roles('admin', 'subadmin')
  async findOne(@Res() res, @Req() req, @Param('id') id: String) {
    try {
      const cat = await this.catPhaseService.findOne(req, id);
      res.status(HttpStatus.OK).json(cat)
    } catch (error) {
      throw error
    }
  }

  // Only admin access
  @Post(':id')
  @Roles('admin', 'subadmin')
  async update(@Res() res, @Req() req, @Param('id') id: String, @Body() updateCatPhaseDto: UpdateCatPhaseDto) {
    try {
      await this.catPhaseService.update(req, id, updateCatPhaseDto);
      res.status(HttpStatus.OK).json('Category has been updated successfully')
    } catch (error) {
      throw error
    }
  }

  // Only admin, subadmin access
  @Post('remove/:id')
  @Roles('admin', 'subadmin')
  async remove(@Res() res, @Req() req, @Param('id') id: String[]) {
    try {
      await this.catPhaseService.remove(req, id);
      res.status(HttpStatus.OK).json('Category is deleted successfully') 
    } catch (error) {
      throw error
    }
  }

  //  Dropdowns 

  //  category
  @Post('allCats/dropdown')
  async allCats(@Res() res, @Req() req, @Body('storeName') storeName: String){
    try {
      const cats = await this.catPhaseService.allCats(storeName)
      res.status(HttpStatus.OK).json(cats)
    } catch (error) {
      throw error
    }
  }

  //Phases of single category
  @Post('allPhases/dropdown')
  async allPhases(@Res() res, @Req() req, @Body('category') category: String){
    try {
      const phases = await this.catPhaseService.allPhases(category)
      res.status(HttpStatus.OK).json(phases)
    } catch (error) {
      throw error
    }
  }

  // Export
  @Post('export/data')
  @Roles('admin', 'subadmin')
  async exportData(@Res() res, @Req() req, @Body('filter') filter: Object, @Body('storeName') storeName: String = ''){
    try {
      await this.catPhaseService.exportData(filter, req, res, storeName)
      return
    } catch (error) {
      throw error
    }
  }

  // Import
  @Post('import/data/categories')
  @Roles('admin', 'subadmin')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'text/csv'
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files,
    @Req() req,
    @Res() res,
  ){
    try {
      const csvFile = fs.readFileSync(files[0].path, 'utf8');
      
      const csvData = csvFile.split(/\r\n|\n/);
      let data=[];

      let categories = []
      let catRepeated = []
      let catExists = []
      let storesInvalid = []
      let validStores
      if (req.user.role === "admin"){
        validStores = await this.storeService.allValidStores()
      }else{
        validStores = [req.user.storeName]
      }

      for (let i = 0; i < csvData.length; i++) {
        const element = csvData[i];
        let reg = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
        let currentline = element.split(reg);
        if (currentline[0] && currentline[1]){
          const category = currentline[0].trim()
          const storeName = currentline[1].trim()
          if (!validStores.includes(storeName) && !storesInvalid.includes(storeName)){
            storesInvalid.push(storeName)
          }
          else if (categories.includes(category)){
            if (!catRepeated.includes(category)){
              console.log(catRepeated)
              catRepeated.push(category)
            }
          }else{
            const catExist = await this.catPhaseService.catExists(category, storeName)
            if (catExist && !catExists.includes(catExist)) {
              catExists.push(category)
            }
            categories.push(category)
          }
        }  
      }
      
      let message = ''
      if (storesInvalid.length > 0){
        message += `\nStores invalid: ${storesInvalid}.`
      }
      if (catRepeated.length > 0){
        message += `\nCategories repeated: ${catRepeated}.`
      }
      if (catExists.length > 0){
        message += `\nCategories already exists: ${catExists}.`
      }

      if (message){
        throw new HttpException(message, HttpStatus.BAD_REQUEST)
      }

      csvData.forEach((element) => {
        let obj
        let reg = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
        let currentline = element.split(reg);

        if (currentline[0] && currentline[1]){
          obj = {}
          obj["category"] = currentline[0].trim()
          obj["storeName"] = currentline[1].trim()
          const categoryPhases = []
          for (let j = 2; j < currentline.length; j++) {
            if (currentline[j] === ""){
              break
            }
            categoryPhases.push(currentline[j].trim())
          }
          obj["categoryPhases"] = categoryPhases
        }

        if (obj){
          data.push(obj);
        }
      })

      for (let index = 0; index < data.length; index++) {
        await this.catPhaseService.create(req, data[index]);      
      }
      res.status(HttpStatus.OK).json("Categories are created successfully");
    } catch (error) {
      throw error
    }
  }
}
