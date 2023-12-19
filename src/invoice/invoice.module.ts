import { Module, forwardRef } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceSchema } from './schema/invoice.schema';
import { BucketModule } from 'src/bucket/bucket.module';
import { StoreModule } from 'src/store/store.module';
import { EmailModule } from 'src/email/email.module';
import { TimeModule } from 'src/time/time.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: "Invoice", schema: InvoiceSchema}]),
    forwardRef(() => BucketModule),
    forwardRef(() => StoreModule),
    forwardRef(() => EmailModule),
    forwardRef(() => TimeModule),
    
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService]
})
export class InvoiceModule {}
