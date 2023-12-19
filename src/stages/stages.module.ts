import { Module } from '@nestjs/common';
import { StagesService } from './stages.service';
import { StagesController } from './stages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StagesSchema } from './schema/stages.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: "Stages", schema: StagesSchema}]),
  ],
  controllers: [StagesController],
  providers: [StagesService],
  exports: [StagesService],
})
export class StagesModule {}
