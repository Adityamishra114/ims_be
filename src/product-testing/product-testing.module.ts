import { Module, forwardRef } from '@nestjs/common';
import { ProductTestingService } from './product-testing.service';
import { ProductTestingController } from './product-testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductTestingSchema } from './schema/productTesting.schema';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'ProductTesting', schema: ProductTestingSchema}]),
    forwardRef(() => ProductModule)
  ],
  controllers: [ProductTestingController],
  providers: [ProductTestingService],
  exports: [ProductTestingService],
})
export class ProductTestingModule {}
