const mongoose = require("mongoose");

export const ProductPuchaseSchema = new mongoose.Schema({
  prodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  purchaseOrderNo: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'partially paid'],
    default: 'unpaid',
    trim: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  expectedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  Rate_Unit: {
    type: Number
  },
  quantity:{
      type: Number,
      default: 1
  },
  totalValue: {
      type: Number
  },
  discount: {
      type: Number,
      default: 0
  },
  discountedPrice: {
      type: Number,
  },
  GST: {
      type: Number,
  },
  GSTValue: {
      type: Number,
  },
  costPrice: {
      type: Number
  },
  manufacturer: {
    type: String,
    trim: true
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer"
  },
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
  paidBy: {
    type: String,
    trim: true
  },
  paidById: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  paidByRole: {
    type: String,
    trim: true
  },
  paidAt: {
    type: Date,
  },
});

