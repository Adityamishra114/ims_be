import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceInterface } from './interface/invoice.interface';
import { StoreService } from 'src/store/store.service';
import { EmailService } from 'src/email/email.service';
import { TimeService } from 'src/time/time.service';


@Injectable()
export class InvoiceService {
  constructor(@InjectModel('Invoice') private readonly invoiceModel : Model<InvoiceInterface>,
  @Inject(forwardRef(() => StoreService)) private readonly storeService: StoreService,
  @Inject(forwardRef(() => EmailService)) private readonly emailService: EmailService,
  @Inject(forwardRef(() => TimeService)) private readonly timeService: TimeService,
  ){}

  // used in store
  async changeStoreName(storeName, newStoreName){
    try {
      await this.invoiceModel.updateMany(
        {storeName},
        {storeName: newStoreName}
      )
      return 

    } catch (error) {
      throw error
    }
  }

  async squence(storeName){
    try {

      // Get today's date at 00:00:00
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTodayUTC = startOfToday.getTime() 
      const start = new Date(startOfTodayUTC)

      // Get tomorrow's date at 00:00:00
      const startOfTomorrowUTC = startOfTodayUTC + 24 * 60 * 60 * 1000
      const end = new Date(startOfTomorrowUTC)

      // Use the two dates to filter documents
      const invoice = await this.invoiceModel.find({
        createdAt: {
          $gte: start,
          $lt: end
        }
      })

      if (invoice.length === 0){
        return 0
      }
      return invoice[invoice.length - 1]

    } catch (error) {
      throw error
    }
  }

  async create(invoiceDetails) {
    try {

      // create invoice number
      const date = Date.now()
      const ISTdate = date + (5 * 60 * 60 * 1000 + 30 * 60 * 1000)
      const ISTDate = new Date(ISTdate) 
        
      const stringDate = ISTDate.toISOString().split('T')[0];
      let invoiceNo = `${stringDate}_INV_`

      // Create seq
      const lastInv = await this.squence(invoiceDetails.storeName)
      
      if (lastInv){
        console.log(lastInv);
        invoiceNo += `${lastInv.seq+1}`
        invoiceDetails.seq = lastInv.seq + 1
      }else{
        invoiceNo += `${1}`
      }

      invoiceDetails.invoiceNo = invoiceNo
      // console.log(invoiceDetails);

      //  get storeId
      const storeId = (await this.storeService.findName(invoiceDetails.storeName))._id
      invoiceDetails.storeId = storeId

      // add into time's income
      const month = new Date().getMonth()
      const year = new Date().getFullYear()
      await this.timeService.addIncome(invoiceDetails.storeName, month, year, invoiceDetails.orderTotal)


      // copy details from bucket
      const newInvoice = new this.invoiceModel(invoiceDetails)
      await newInvoice.save()
      return newInvoice
      
    } catch (error) {
      throw error
    }
  }

  async findAll(req, filter) {
    try {
      if (filter && filter.key !== "invoiceNo") throw new HttpException('Invalid entry', HttpStatus.BAD_REQUEST)
      
      let query = {}

      if (req.user.role === 'subadmin'){
        query["soldById"] = req.user._id
      }

      if (filter){
        query[filter.key] = filter.value
      }

      const invoices = await this.invoiceModel.find(query).sort({createdAt: -1})
      return invoices
    } catch (error) {
      throw error
    }
  }

  async findOne(req, id: String) {
    try {
      let query = {_id:id}
  
      if (req.user.role === 'subadmin'){
        query["soldById"] = req.user._id
      }

      const invoice = await this.invoiceModel.findOne(query)
      .populate([{
        path: 'customerId',
        select: '-purchaseHistory -_id'
      },
      {
        path: 'productIds',
        select: '-testingDetails -_id'
      },
      {
        path: 'storeId',
        select: '-engineers -subAdmin -_id'
      }])
      
      if (!invoice) throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND)
      return invoice
    } catch (error) {
      throw error
    }
  }

  async permission(id, req){
    try {
      const invoice = await this.invoiceModel.findOne({_id:id})
      if (!invoice) throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND)

      invoice.permitted = true

      // send mail to security
      let message = '<h1>Hey there</h1>'
      const options = {
        to: "riyapatel21@iitk.ac.in",
        html: message,
        subject: "Permission to exit"
      }
      
      await this.emailService.sendEmail(options)

      await invoice.save()
      return

    } catch (error) {
      throw error
    }
  }

}
