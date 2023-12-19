import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { TimeService } from './time.service';
import { CreateTimeDto } from './dto/create-time.dto';
import { UpdateTimeDto } from './dto/update-time.dto';

@Controller('time')
export class TimeController {
  constructor(private readonly timeService: TimeService) {}

  // get years
  @Get('years')
  async getYears(@Res() res){
    try {
      const years = await this.timeService.getYears()
      res.status(HttpStatus.OK).json(years)
    } catch (error) {
      throw error
    }
  }
}
