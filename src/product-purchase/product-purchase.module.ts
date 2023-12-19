import { Module, forwardRef } from '@nestjs/common';
import { ProductPurchaseService } from './product-purchase.service';
import { ProductPurchaseController } from './product-purchase.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductPuchaseSchema } from './schema/productPurchase.schema';
import { ProductModule } from 'src/product/product.module';
import { StagesModule } from 'src/stages/stages.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'ProductPurchase', schema: ProductPuchaseSchema}]),
    forwardRef(() => ProductModule),
    forwardRef(() => StagesModule),
  ],
  controllers: [ProductPurchaseController],
  providers: [ProductPurchaseService],
  exports: [ProductPurchaseService],
})
export class ProductPurchaseModule {}
