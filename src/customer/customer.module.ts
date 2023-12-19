import { Module, forwardRef } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema } from './schema/customer.schema';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { BucketModule } from 'src/bucket/bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Customer', schema: CustomerSchema}]),
    forwardRef(() => BucketModule)
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService]
})
export class CustomerModule {}
