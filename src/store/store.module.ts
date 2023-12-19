import { Module, forwardRef } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreSchema } from './schema/store.schema';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { BucketModule } from 'src/bucket/bucket.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { EngineerHistoryModule } from 'src/engineer-history/engineer-history.module';
import { CatPhaseModule } from 'src/cat-phase/cat-phase.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';
import { CustomerModule } from 'src/customer/customer.module';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Store', schema: StoreSchema}]),
    forwardRef(() => UserModule),
    forwardRef(() => ProductModule),
    forwardRef(() => BucketModule),
    forwardRef(() => MaterialsModule),
    forwardRef(() => CatPhaseModule),
    forwardRef(() => EngineerHistoryModule),
    forwardRef(() => InvoiceModule),
    forwardRef(() => PurchaseOrderModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => ManufacturerModule),
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService]
})
export class StoreModule {}
