import { Module, forwardRef } from '@nestjs/common';
import { EngineerHistoryService } from './engineer-history.service';
import { EngineerHistoryController } from './engineer-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EngineerHistorySchema } from './schema/engineerHistory.schema';
import { UserModule } from 'src/user/user.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { StoreModule } from 'src/store/store.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'EngineerHistory', schema: EngineerHistorySchema}]),
    forwardRef(() => UserModule),
    forwardRef(() => MaterialsModule),
    forwardRef(() => ProductModule),
    forwardRef(() => StoreModule),
  ],
  controllers: [EngineerHistoryController],
  providers: [EngineerHistoryService],
  exports: [EngineerHistoryService],
})
export class EngineerHistoryModule {}
