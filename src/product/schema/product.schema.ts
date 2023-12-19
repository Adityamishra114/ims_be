import { Mongoose } from "mongoose";

const mongoose = require("mongoose");
  
export const ProductSchema = new mongoose.Schema({
  prodPurchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductPurchase"
  },
  prodTestingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductTesting"
  },
  prodSellId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductSell"
  },
  status: {
    type: String,
    enum: ["ordered", "received", "new", "inProgress", "pending", "error", "completed", "soldOut", "returned"],
    default: "ordered",
    trim: true
  },
  moved: {
    type: Boolean,
    default: false
  },
  phase: {
    type: String,
    trim: true
  },
  productName: {
    type: String,
    trim: true,
    required:true
  },
  category: {
    type: String,
    required:true,
    trim: true,
  },
  prevStore: {
    type: String,
    trim: true
  },
  storeName: {
    type: String,
    required:true,
    trim: true,
  },
  barcodeId:{
    type:String,
    trim: true,
    unique: true
  },
  lotNo: {
    type: String,
    trim: true,
  },
  articleCode: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  HSNCode: {
    type: String,
    trim: true,
  },
  productId:{ 
    type: String,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CatPhase",
  },
  storeId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Store"
  },
  bucketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bucket",
  },
  bucket: {
    type: String,
    trim: true
  },
  assignedTo: [{
    type: String,
    trim: true
  }],
  assignedToIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  assignedToRole: {
    type: String,
    trim: true
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  createdBy: {
    type: String,
    trim: true
  },
  createdByRole: {
    type: String,
    trim: true
  },
  updatedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  updatedBy: {
    type: String,
    trim: true
  },
  updatedByRole: {
    type: String,
    trim: true
  },
  storeShiftById: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
  },
  storeShiftBy: {
    type: String,
    trim: true
  },
  storeShiftByRole: {
    type: String,
    trim: true
  },
  storeShiftAt:{
    type: Date
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
});

