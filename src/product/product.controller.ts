import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus, HttpException, UseGuards, UseInterceptors, UploadedFiles, ParseFilePipeBuilder, Query, forwardRef, Inject } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { RolesGuard } from 'src/auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs'
import { AssignEngineerDto } from './dto/assign-engineer.dto';
import { AllProductsDto } from './dto/allProducts.dto';
import { UpdateCostDto } from './dto/updateCost.dto';
import { MaterialsDto } from './dto/materials.dto';
import { allowedHeadersProduct } from 'src/headers';
import { StoresTransferDto } from './dto/stores-transfer.dto';
import { StagesService } from 'src/stages/stages.service';

@Controller('product')
@UseGuards(RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService, @Inject(forwardRef(() => StagesService))private readonly stagesService: StagesService) {}

  // create
  @Post('create')
  @Roles('admin', 'subadmin')
  async create(@Res() res, @Req() req, @Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productService.create(req, createProductDto)
      res.status(HttpStatus.CREATED).json('Product has been created successfully')
    } catch (error) {
      throw error
    }
  }
  
  // Get purchase all
  @Post('allproducts')
  async findFiltersAll(@Res() res, @Req() req, @Body() allProductsDto: AllProductsDto, @Query('page') page: String = "1", @Query('limit') limit: number = 50) {
    // if (!allProductsDto.type) throw new HttpException('Invalid Entry', HttpStatus.BAD_REQUEST)
    try {
      let products = await this.productService.findFiltersAll(req, allProductsDto, page, limit)
      res.status(HttpStatus.OK).json({products}) 
      return
    } catch (error) {
      throw error
    }
  }

  // Get one
  @Get('/:id')
  async findId(@Res() res, @Req() req, @Param('id') id: String,){
    try {
      const product = await this.productService.findId(req, id)
      res.status(HttpStatus.OK).json(product)
    } catch (error) {
      throw error
    }
  }

  // filters on get one
  @Post('single/:id')
  @Roles('admin', 'subadmin')
  async findOne(@Res() res, @Req() req, @Param('id') id: String, @Body('filters') filters: Array<Object> = [],) {
    try {
      const details = await this.productService.findOneFilters(req, id, filters);
      res.status(HttpStatus.OK).json(details)
    } catch (error) {
      throw error
    }
  }

  // update only personal details
  @Post('update/:id')  
  @Roles('admin', 'subadmin')
  async update(@Res() res, @Req() req, @Param('id') id: String, @Body() updateProductDto: UpdateProductDto) {
    try {
      await this.productService.update(req, id, updateProductDto);
      res.status(HttpStatus.OK).json('Product has been updated successfully')
    } catch (error) {
      throw error
    }
  }
 
  // Only admin, subadmin access
  // when not inProgress
  @Post('delete/products')
  @Roles('admin', 'subadmin')
  async remove(@Res() res, @Req() req, @Body('ids') ids: String[]) {
    try {
      let products = []
      for (let i = 0; i < ids.length; i++) {
        const productId = await this.productService.remove(req, ids[i]);
        if (productId){
          products.push(productId)
        }
      }
      if (products.length === 0){
        res.status(HttpStatus.OK).json('Products has been deleted')
      }else{
        res.status(HttpStatus.BAD_REQUEST).json(`Products of productIds ${products} are under testing and can not be deleted`)
      }
      
    } catch (error) {
      throw error
    }
  }

   // find product based on barcodeId
  @Post('barcodeId/:id')
  async findBarcode(@Res() res, @Req() req, @Param('id') id: String, @Body('type') type: String){
    try {
      const product = await this.productService.findBarcode(req, id, type)
      res.status(HttpStatus.OK).json(product)
    } catch (error) {
      throw error
    }
  }

  // Stores transfer
  @Post('stores/move')
  @Roles('admin', 'subadmin')
  async storesTransfer(@Res() res, @Req() req, @Body() storesTransferDto: StoresTransferDto) {
    try {
      let products = []
      for (let i = 0; i < storesTransferDto.ids.length; i++) {
        const product = await this.productService.storesTransfer(req, storesTransferDto.ids[i], storesTransferDto.store1, storesTransferDto.store2);
        if (product){
          products.push(product.productId)
        }
      }
      if (products.length === 0){
        res.status(HttpStatus.OK).json('Products has been moved succefully')
      }else{
        res.status(HttpStatus.BAD_REQUEST).json(`Products with productIds ${products} can not be moved.`)
      }
    } catch (error) {
      throw error
    }
  }


  // Only admin, subadmin access
  // assign user
  @Post('assign/engineer')
  @Roles('admin', 'subadmin')
  async assignEngineer(@Res() res, @Req() req, @Body() assignEngineerDto: AssignEngineerDto){
    const {ids} = assignEngineerDto
    try {
      let products = []
      for (let i = 0; i < ids.length; i++) {
        const productId = await this.productService.assignEngineer(req, ids[i], assignEngineerDto)
        if (productId){
          products.push(productId)
        }
      }
      if (products.length === 0){
        res.status(HttpStatus.OK).json('Product testing phase has been assigned successfully')
      }else{
        res.status(HttpStatus.BAD_REQUEST).json(`Products of productIds ${products} are under testing and new testing phase can not be assigned`)
      }
    } catch (error) {
      throw error
    }
  }

  //  Only engineer access
  // close product
  @Post('close/:id')
  @Roles('engineer')
  async closeProduct(@Res() res, @Req() req, @Param('id') id: String, @Body() materialsDto: MaterialsDto){
    try {
      await this.productService.closeProduct(req, id, materialsDto.status, materialsDto.remark, materialsDto.materials)
      res.status(HttpStatus.OK).json('Product testing phase has been closed successfully')
    } catch (error) {
      throw error
    }
  }

  // Only admin, sub admin access
  // Move to inventory
  @Post('inventory/move')
  @Roles('admin', 'subadmin')
  async inventoryMove(@Res() res, @Req() req, @Body('ids') ids: String[]){
    try {
      let products = []
      for (let i = 0; i < ids.length; i++) {
        const productId = await this.productService.inventoryMove(req, ids[i])
        if (productId){
          products.push(productId)
        }
      }
      if (products.length === 0){
        res.status(HttpStatus.OK).json('Products has been moved to inventory')
      }else{
        res.status(HttpStatus.BAD_REQUEST).json(`Products of productIds ${products} can not be moved to inventory`)
      }
    } catch (error) {
      throw error
    }
  }

  // Retrieve from inventory if not sold out
  @Post('inventory/back')
  @Roles('admin', 'subadmin')
  async inventoryBack(@Res() res, @Req() req,  @Body('ids') ids: String[]){
    try {
      let products = []
      for (let i = 0; i < ids.length; i++) {
        const productId = await this.productService.inventoryBack(req, ids[i])
        if (productId){
          products.push(productId)
        }
      }
      if (products.length === 0){
        res.status(HttpStatus.OK).json('Products has been moved back from inventory')
      }else{
        res.status(HttpStatus.BAD_REQUEST).json(`Products of productIds ${products} can not be moved back from inventory`)
      }
    } catch (error) {
      throw error
    }
  }

  // // Only admin, sub admin access
  // // inventory get
  // @Post('inventory/allproducts')
  // @Roles('admin', 'subadmin')
  // async inventory(@Res() res, @Req() req, @Body() allProductsDto: AllProductsDto, @Query('page') page: String = "1", @Query('limit') limit: number = Number.MAX_SAFE_INTEGER ){
  //   try {
  //     const products = await this.productService.inventory(req, allProductsDto, page, limit)
  //     res.status(HttpStatus.OK).json(products)
  //   } catch (error) {
  //     throw error
  //   }
  // }

  // // // Only admin, sub admin access
  // // // sell product
  // // @Post('sellProduct/:id')
  // // @Roles('admin', 'subadmin')
  // // async sellProduct(@Res() res, @Req() req, @Param('id') id: String, @Body('invoiceData') invoiceData: Object){
  // //   try {
  // //     await this.productService.sellProduct(req, id, invoiceData)
  // //     res.status(HttpStatus.OK).json('Product has been sold')
  // //   } catch (error) {
  // //     throw error
  // //   }
  // // }

  // // // Only admin, sub admin access
  // // // get invoice
  // // @Get('getInvoice/:id')
  // // @Roles('admin', 'subadmin')
  // // async getInvoice(@Res() res, @Req() req, @Param('id') id: String){
  // //   try {
  // //     const invoice = await this.productService.getInvoice(req, id)
  // //     res.status(HttpStatus.OK).json(invoice)
  // //   } catch (error) {
  // //     throw error
  // //   }
  // // }

  // // Export
  // @Post('export/data')
  // async exportData(@Res() res, @Req() req, @Body() allProductsDto: AllProductsDto){
  //   try {
  //     console.log(allProductsDto)
  //     await this.productService.exportData(req, allProductsDto, res)
  //     return
  //   } catch (error) {
  //     throw error
  //   }
  // }

  // // Import
  // @Post('import/data/products')
  // @UseInterceptors(FilesInterceptor('files'))
  // async uploadFile(
  //   @UploadedFiles(
  //     new ParseFilePipeBuilder()
  //       .addFileTypeValidator({
  //         fileType: 'text/csv'
  //       })
  //       .build({
  //         errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  //       }),
  //   )
  //   files,
  //   @Req() req,
  //   @Res() res,
  // ){
  //   try {
  //     const csvFile = fs.readFileSync(files[0].path, 'utf8');
  //     let csvHeader = csvFile.split(/\r\n|\n/)[0].split(',');

  //     for (let i = 0; i < csvHeader.length; i++) {
  //       csvHeader[i] = csvHeader[i].trim();
  //     }

  //     const allowedHeaders = allowedHeadersProduct
  //     let correctHeaders = []
  //     for (let i = 0; i < csvHeader.length; i++) {
  //       const header = csvHeader[i]
  //       if (allowedHeaders.indexOf(header) === -1){
  //         correctHeaders.push(header)
  //       }
  //     }

  //     if (correctHeaders.length > 0){
  //       throw new HttpException(`Column names ${correctHeaders} are not acceptable`, HttpStatus.BAD_REQUEST)
  //     }

  //     const requiredFields = ["productName", "category", "storeName", "GST", "Rate_Unit", "barcodeId"]
      
  //     let missingHeaders = []
  //     for (let i = 0; i < requiredFields.length; i++) {
  //       if (csvHeader.indexOf(requiredFields[i]) === -1) {
  //         missingHeaders.push(requiredFields[i])
  //       }
  //     }
  //     if (missingHeaders.length > 0){
  //       throw new HttpException(`Required headers ${missingHeaders} are missing`, HttpStatus.BAD_REQUEST)
  //     }

  //     let barcodes = []
  //     let repeatedBarcodeId = []
  //     const csvData = csvFile.split(/\r\n|\n/).slice(1);
  //     let data=[];
  //     csvData.forEach((element) => {
  //       let obj = {};
  //       let reg = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
  //       let currentline = element.split(reg);
  //       for (let j = 0; j < csvHeader.length; j++) {
  //         if (currentline[j]){
  //           currentline[j] = currentline[j].trim()
  //           if (csvHeader[j] === "barcodeId"){
  //             if (barcodes.includes(currentline[j])){
  //               if (!repeatedBarcodeId.includes(currentline[j])) repeatedBarcodeId.push(currentline[j])
  //               continue
  //             }else{
  //               barcodes.push(currentline[j])
  //             }
  //           }
  //         }
  //         const price = ["Rate_Unit", "sellingPrice", "quantity"]
  //         if (price.indexOf(csvHeader[j]) !== -1 && currentline[j]){
  //           currentline[j] = currentline[j].replace(/,/g, '')
  //           currentline[j] = currentline[j].replace(/"/g, '')
  //         }
  //         obj[csvHeader[j]] = currentline[j];
  //       }
  //       let add = false
  //       for(let key in obj){
  //         if (obj[key]){
  //           add = true
  //           break
  //         }
  //       }
  //       if (add){
  //         data.push(obj);
  //       }
  //     })
  //     let message = ''
  //     if (repeatedBarcodeId.length > 0){
  //       message = `\nBarcodeIds ${repeatedBarcodeId} are repeated.`
  //     }
  //     const msg = await this.productService.createMany(req, data, message);
  //     return res.status(HttpStatus.OK).json({
  //       message: msg,
  //     });
  //   } catch (error) {
  //     throw error
  //   }
  // }
}
