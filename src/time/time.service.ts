import { Injectable } from '@nestjs/common';
import { CreateTimeDto } from './dto/create-time.dto';
import { UpdateTimeDto } from './dto/update-time.dto';
import { TimeInterface } from './interface/time.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TimeService {
  
  constructor(@InjectModel('Time') private readonly timeModel: Model<TimeInterface>){}

  // get storeName, month and year based time - if doesn't exists create one
  async findName(storeName, month, year){
    try {
      let time = await this.timeModel.findOne(
        {storeName, month, year}
      )
      if (!time){
        time = new this.timeModel({storeName, month, year})
        await time.save()
      }
      return time
    } catch (error) {
      throw error
    }
  }

  // add
  async add(time, para, value){
    try {

      time[para] = `${+time[para] + value}`
      await time.save()
      return
    } catch (error) {
      throw error
    }
  }

  // add income
  async addIncome(storeName, month, year, value){
    try {
      const time = await this.findName(storeName, month, year)
      await this.add(time, 'income', value)
      return

    } catch (error) {
      throw error
    }
  }
  
  // add expense
  async addExpense(storeName, month, year, value){
    try {
      const time = await this.findName(storeName, month, year)
      await this.add(time, 'expense', value)
      return

    } catch (error) {
      throw error
    }
  }
  
  // add damaged goods received
  async addDamagedGoods(storeName, month, year, value){
    try {
      const time = await this.findName(storeName, month, year)
      await this.add(time, 'damagedGoods', value)
      return

    } catch (error) {
      throw error
    }
  }

  // add store transfer from
  async addStoreFrom(storeName, month, year, value){
    try {
      const time = await this.findName(storeName, month, year)
      await this.add(time, 'movedFrom', value)
      return

    } catch (error) {
      throw error
    }
  }
  
  // add store transfer to
  async addStoreTo(storeName, month, year, value){
    try {
      const time = await this.findName(storeName, month, year)
      await this.add(time, 'movedTo', value)
      return

    } catch (error) {
      throw error
    }
  }

  // get year
  async getYears(){
    try {
      const times = await this.timeModel.find({}, {year:1})
      
      let years = []
      for (let i = 0; i < times.length; i++) {
        const time = times[i];
        if (!years.includes(time.year)) years.push(time.year)
      }

      return years

    } catch (error) {
      throw error
    }
  }
  
  // get time
  async getTime(storeName, year){
    try {
      const times = await this.timeModel.find({storeName, year})
      console.log(times)

      let timeValues = []
      let income = []
      let expense = []
      let damagedGoods = []
      let movedFrom = []
      let movedTo = []

      for (let i = 0; i < times.length; i++) {
        const time = times[i];
        timeValues.push(time.month)
        income.push(time.income)
        expense.push(time.expense)
        damagedGoods.push(time.damagedGoods)
        movedFrom.push(time.movedFrom)
        movedTo.push(time.movedTo)
      }

      let timeUpdated = {
        timeValues, income, expense, damagedGoods, movedFrom, movedTo
      }

      return timeUpdated

    } catch (error) {
      throw error
    }
  }




}
