import { Module, forwardRef } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseOrderSchema } from './schema/purchaseOrder.schema';
import { CatPhaseModule } from 'src/cat-phase/cat-phase.module';
import { StoreModule } from 'src/store/store.module';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';
import { ProductModule } from 'src/product/product.module';
import { StagesModule } from 'src/stages/stages.module';
import { TimeModule } from 'src/time/time.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'PurchaseOrder', schema: PurchaseOrderSchema}]),
    forwardRef(() => CatPhaseModule),
    forwardRef(() => StoreModule),
    forwardRef(() => ManufacturerModule),
    forwardRef(() => ProductModule),
    forwardRef(() => StagesModule),
    forwardRef(() => TimeModule),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
