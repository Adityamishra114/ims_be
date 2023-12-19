import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { StoreModule } from 'src/store/store.module';
import { ProductModule } from 'src/product/product.module';
import { BucketModule } from 'src/bucket/bucket.module';
import { EngineerHistoryModule } from 'src/engineer-history/engineer-history.module';
import { MaterialsModule } from 'src/materials/materials.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
    forwardRef(() => StoreModule),
    forwardRef(() => ProductModule),
    forwardRef(() => BucketModule),
    forwardRef(() => EngineerHistoryModule),
    forwardRef(() => MaterialsModule)
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
