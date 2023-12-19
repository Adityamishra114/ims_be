
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MOGO_URI),
    ],

    controllers: [],
    providers: [],
    exports: []
})

export class DatabaseModule {}