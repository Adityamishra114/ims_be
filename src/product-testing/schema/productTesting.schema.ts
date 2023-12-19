import { Mongoose } from "mongoose";

const mongoose = require("mongoose");

export const TestingDetailsSchema = new mongoose.Schema({
    assignedTo:{
      type: String,
      trim: true
    },
    assignedToId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    assignedBy:{
      type: String,
      trim: true
    },
    assignedById:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    assignedByRole:{
      type: String,
      trim: true
    },
    task: {
      type: String,
      trim: true
    },
    status:{
      type:String,
      enum:["success","failed"],
      trim: true
    },
    remark:{
      type: String,
      trim: true
    },
    phase: {
      type: String,
      trim: true
    },
    assignedAt:{
      type: Number,
    },
    dueDate: {
      type: Number
    },
    completed: {
      type: String,
      enum: ["ontime", "overdue"],
      trim: true
    },
    closedAt:{
      type: Number,
    },
    duration: {
      type: Number
    }
  },{_id:false})

  
export const ProductTestingSchema = new mongoose.Schema({
  prodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  UOM: {
    type: String,
    trim: true,
  },
  testingDetails: [TestingDetailsSchema],
  closedBy: {
    type: String,
    trim: true
  },
  closedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  closedByRole: {
    type: String,
    trim: true
  },
  closedAt: {
    type: Date,
  },
  movedBackBy:{
    type: String,
    trim: true
  },
  movedBackById:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  movedBackByRole: {
    type: String,
    trim: true
  },
  movedBackAt: {
    type: Date,
  },
  date: {
    type: String,
     trim: true
  }
});

