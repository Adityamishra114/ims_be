import { Module, forwardRef } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CatPhaseModule } from 'src/cat-phase/cat-phase.module';
import { StoreModule } from 'src/store/store.module';
import { UserModule } from 'src/user/user.module';
import { ProductSchema } from './schema/product.schema';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'src/multer-conf/multer-conf.service';
import { CustomerModule } from 'src/customer/customer.module';
import { BucketModule } from 'src/bucket/bucket.module';
import { EngineerHistoryModule } from 'src/engineer-history/engineer-history.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { ProductPurchaseModule } from 'src/product-purchase/product-purchase.module';
import { ProductTestingModule } from 'src/product-testing/product-testing.module';
import { ProductSellModule } from 'src/product-sell/product-sell.module';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';
import { StagesModule } from 'src/stages/stages.module';
import { TimeModule } from 'src/time/time.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Product', schema: ProductSchema}]),
    forwardRef(() => StoreModule),
    forwardRef(() => UserModule),
    forwardRef(() => CatPhaseModule),
    forwardRef(() => BucketModule),
    forwardRef(() => EngineerHistoryModule),
    forwardRef(() => MaterialsModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => ProductPurchaseModule),
    forwardRef(() => ProductTestingModule),
    forwardRef(() => ProductSellModule),
    forwardRef(() => ManufacturerModule),
    forwardRef(() => StagesModule),
    forwardRef(() => TimeModule),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
