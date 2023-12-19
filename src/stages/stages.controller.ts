import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { StagesService } from './stages.service';

@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get('create')
  async findName(@Req() req, @Res() res, @Body('storeName') storeName: String, @Body('name') name: String){
    try {
      const stages = await this.stagesService.addProducts(storeName, name, 20)
      res.status(HttpStatus.OK).json(stages)
      return stages
    } catch (error) {
      throw error
    }
  }

}
