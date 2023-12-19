import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EmailInterface } from "./interface/email.interface";
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()

export class EmailService{
    constructor(@InjectModel('Email') private readonly emailModel: Model<EmailInterface>, private mailerService: MailerService){}

    async sendEmail(options){

        try {
          let setup = {
            to: options.to,
            from: process.env.AUTH_EMAIL,
            subject: options.subject,
            html: options.html && options.html,
            text: options.text && options.text
          }
          console.log(setup);
          const info = await this.mailerService.sendMail(setup)
    
          await this.emailModel.create({
            sentTo: options.email,
            sentBy: process.env.AUTH_EMAIL,
            subject: options.subject,
            text: options.html ? JSON.stringify(options.html) : JSON.stringify(options.text) ,
            messageId: info.messageId
          })
          
          return 'Email has been sent successfully'
    
        } catch (error) {
          console.log(error.message);
          throw new HttpException(`${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR) 
        }
      }
}