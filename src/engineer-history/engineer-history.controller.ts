import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, HttpStatus, HttpException } from '@nestjs/common';
import { EngineerHistoryService } from './engineer-history.service';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorator/auth.decorator';
import { AssignMaterialsDto } from './dto/AssignMaterialsDto.dto';

@Controller('engineer-history')
@UseGuards(RolesGuard)
export class EngineerHistoryController {
  constructor(private readonly engineerHistoryService: EngineerHistoryService) {}

  // asign materials get
  @Get('assignMaterials/data/:engId')
  @Roles('admin', 'subadmin')
  async materialsData(@Res() res, @Req() req, @Param('engId') engId: String){
    try {
      const {materialsAsked, materialsAvailable, rawMaterials} = await this.engineerHistoryService.materialsData(req, engId)
      res.status(HttpStatus.OK).json({materialsAsked, materialsAvailable, rawMaterials})
    } catch (error) {
      throw error
    }
  }

  // assign materials post
  @Post('assignMaterials')
  @Roles('admin', 'subadmin')
  async assignMaterials(@Res() res, @Req() req, @Body() assignMaterialsDto: AssignMaterialsDto){
    if (!assignMaterialsDto.engineerId) throw new HttpException('Invalid Entry', HttpStatus.BAD_REQUEST)
    try {
      await this.engineerHistoryService.assignMaterials(req, assignMaterialsDto)
      res.status(HttpStatus.OK).json('Raw materials has been assigned')
    } catch (error) {
      throw error
    }
  }

  // ask fro materials get
  @Get('askMaterials/data')
  @Roles('engineer')
  async materialsDataAsking(@Res() res, @Req() req){
    try {
      const {materialsAsked, materialsAvailable} = await this.engineerHistoryService.materialsDataAsking(req)
      res.status(HttpStatus.OK).json({materialsAsked, materialsAvailable})
    } catch (error) {
      throw error
    }
  }
  
  // ask for materials
  @Post('askMaterials')
  async askMaterials(@Res() res, @Req() req, @Body() askMaterialsDto: AssignMaterialsDto){
    try {
      await this.engineerHistoryService.askMaterials(req, askMaterialsDto)
      res.status(HttpStatus.OK).json('Raw materials has been asked')
    } catch (error) {
      throw error
    }
  }
}
