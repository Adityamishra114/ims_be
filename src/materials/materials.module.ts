import { Module, forwardRef } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialsSchema } from './schema/materials.schema';
import { UserModule } from 'src/user/user.module';
import { EngineerHistoryModule } from 'src/engineer-history/engineer-history.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Materials', schema: MaterialsSchema}]),
    forwardRef(() => UserModule),
    forwardRef(() => EngineerHistoryModule),
    forwardRef(() => ProductModule)
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [MaterialsService],
})
export class MaterialsModule {}
