import { Module, forwardRef } from '@nestjs/common';
import { ProductSellService } from './product-sell.service';
import { ProductSellController } from './product-sell.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSellSchema } from './schema/productSell.schema';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'ProductSell', schema: ProductSellSchema}]),
    forwardRef(() => ProductModule)
  ],
  controllers: [ProductSellController],
  providers: [ProductSellService],
  exports: [ProductSellService],
})
export class ProductSellModule {}
