import { Module, forwardRef } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { StoreModule } from 'src/store/store.module';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';
import { CustomerModule } from 'src/customer/customer.module';
import { StagesModule } from 'src/stages/stages.module';
import { TimeModule } from 'src/time/time.module';

@Module({
  imports: [
    forwardRef(() => StoreModule),
    forwardRef(() => ManufacturerModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => StagesModule),
    forwardRef(() => TimeModule),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
