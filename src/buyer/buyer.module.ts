import { Module, forwardRef } from '@nestjs/common';
import { BuyerService } from './buyer.service';
import { BuyerController } from './buyer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BuyerDetailsSchema } from './schema/buyer.schema';
import { BucketModule } from 'src/bucket/bucket.module';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: "Buyer", schema: BuyerDetailsSchema}]),
    forwardRef(() => BucketModule),
    forwardRef(() => ProductModule),
    forwardRef(() => UserModule)
  ],
  controllers: [BuyerController],
  providers: [BuyerService],
  exports: [BuyerService],
})
export class BuyerModule {}
