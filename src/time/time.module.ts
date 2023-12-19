import { Module } from '@nestjs/common';
import { TimeService } from './time.service';
import { TimeController } from './time.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeSchema } from './schema/time.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: "Time", schema: TimeSchema}]),
  ],
  controllers: [TimeController],
  providers: [TimeService],
  exports: [TimeService],
})
export class TimeModule {}
