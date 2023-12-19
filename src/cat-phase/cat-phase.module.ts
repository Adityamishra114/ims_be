import { Module, forwardRef } from '@nestjs/common';
import { CatPhaseService } from './cat-phase.service';
import { CatPhaseController } from './cat-phase.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CatPahseSchema } from './schema/catPahse.schema';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'src/multer-conf/multer-conf.service';
import { ProductModule } from 'src/product/product.module';
import { BucketModule } from 'src/bucket/bucket.module';
import { StoreModule } from 'src/store/store.module';
import { PurchaseOrderModule } from 'src/purchase-order/purchase-order.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:"CatPhase", schema: CatPahseSchema}]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    forwardRef(() => ProductModule),
    forwardRef(() => PurchaseOrderModule),
    forwardRef(() => BucketModule),
    forwardRef(() => StoreModule)
  ],
  controllers: [CatPhaseController],
  providers: [CatPhaseService],
  exports: [CatPhaseService]
})
export class CatPhaseModule {}
