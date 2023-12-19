import { Module, forwardRef } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { BucketController } from './bucket.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BucketSchema } from './schema/bucket.schema';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';
import { CatPhaseModule } from 'src/cat-phase/cat-phase.module';
import { StoreModule } from 'src/store/store.module';
import { CustomerModule } from 'src/customer/customer.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { ProductTestingModule } from 'src/product-testing/product-testing.module';
import { ProductSellModule } from 'src/product-sell/product-sell.module';
import { ProductPurchaseModule } from 'src/product-purchase/product-purchase.module';
import { StagesModule } from 'src/stages/stages.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: "Bucket", schema: BucketSchema}]),
    forwardRef(() => ProductModule),
    forwardRef(() => ProductPurchaseModule),
    forwardRef(() => ProductTestingModule),
    forwardRef(() => ProductSellModule),
    forwardRef(() => UserModule),
    forwardRef(() => CatPhaseModule),
    forwardRef(() => StoreModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => InvoiceModule),
    forwardRef(() => StagesModule),
  ],
  controllers: [BucketController],
  providers: [BucketService],
  exports: [BucketService],
})
export class BucketModule {}
