import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { ConfigModule } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { MongooseModule } from "@nestjs/mongoose";
import { EmailSchema } from "./schema/email.schema";

@Module({
    imports: [
        ConfigModule.forRoot(),
        MailerModule.forRoot({
            transport: {
                service: "gmail",
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASSWORD,
                }
            }
        }),
        MongooseModule.forFeature([{name: "Email", schema: EmailSchema}])
    ],
    providers: [EmailService],
    exports: [EmailService],
})

export class EmailModule {}