import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CustomerService } from 'src/customer/customer.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { StagesService } from 'src/stages/stages.service';
import { StoreService } from 'src/store/store.service';
import { TimeService } from 'src/time/time.service';

@Injectable()
export class DashboardService {
 
  constructor(@Inject(forwardRef(() => StoreService)) private readonly storeService: StoreService,
  @Inject(forwardRef(() => ManufacturerService)) private readonly manufacturerService: ManufacturerService,
  @Inject(forwardRef(() => CustomerService)) private readonly customerService: CustomerService,
  @Inject(forwardRef(() => StagesService)) private readonly stagesService: StagesService,
  @Inject(forwardRef(() => TimeService)) private readonly timeService: TimeService,
  ){}

  async products(req, productsDashboardDto){
    try {
      let {storeName, type} = productsDashboardDto

      let stores 
      let stages = {}
      let manufacturers
      let customers

      // get store vise products
      stores = await this.storeService.dashboard(req)

      // get stages vise products (either storeName is given or default 1st store created)
      if (!storeName){
        if (req.user.role === 'subadmin'){
          storeName = req.user.storeName
        }else{
          storeName = stores.storeNames[0]
        }
      }
      if (storeName){
        stages = await this.stagesService.dashboard(req, storeName)
      }

      // manufacturer vise products - number or value
      manufacturers = await this.manufacturerService.dashboard(type)
      
      // customer vise products - number or value
      customers = await this.customerService.dashboard(type)
      
      return {stores, stages, manufacturers, customers}
    } catch (error) {
      throw error
    }
  }

  async time(req, timeDashboardDto){
    try {
      let {storeName, year} = timeDashboardDto

      if (!storeName){
        if (req.user.role === 'subadmin'){
          storeName = req.user.storeName
        }else{
          const store = await this.storeService.allStores(req)
          storeName = store[0].storeName
        }
      }

      if (!year){
        const years = await this.timeService.getYears()
        year = years[years.length - 1]
      }
      
      if (!storeName || !year){
        let timeValues = {}, income = {}, expense = {}, damagedGoods = {}, movedFrom = {}, movedTo = {}
        return {timeValues, income, expense, damagedGoods, movedFrom, movedTo, year}
      }
      
      const {timeValues, income, expense, damagedGoods, movedFrom, movedTo} = await this.timeService.getTime(storeName, year)
      return {timeValues, income, expense, damagedGoods, movedFrom, movedTo, year}

    } catch (error) {
      throw error
    }
  }

}
