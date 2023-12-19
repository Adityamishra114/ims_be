import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ProductsDashboardDto } from './dto/products-dashboard.dto';
import { TimeDashboardDto } from './dto/time-dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // get store, stage, manufacturer, customer vise
  @Post('products')
  async products(@Res() res, @Req() req, @Body() productsDashboardDto: ProductsDashboardDto){
    try {
      const {stores, stages, manufacturers, customers} = await this.dashboardService.products(req, productsDashboardDto)
      res.status(HttpStatus.OK).json({stores, stages, manufacturers, customers})
    } catch (error) {
      throw error
    }
  }


  // get monthly track - income, expense, damaged, store transfer
  @Post('time')
  async time(@Res() res, @Req() req, @Body() timeDashboardDto: TimeDashboardDto){
    try {
      const {timeValues, income, expense, damagedGoods, movedFrom, movedTo, year} = await this.dashboardService.time(req, timeDashboardDto)
      res.status(HttpStatus.OK).json({timeValues, income, expense, damagedGoods, movedFrom, movedTo, year})
    } catch (error) {
      throw error
    }
  }
  


}
