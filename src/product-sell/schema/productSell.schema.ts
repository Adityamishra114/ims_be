

const mongoose = require("mongoose");
  
export const ProductSellSchema = new mongoose.Schema({
  prodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
  },
  invoiceNo: {
    type: String
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  soldBy: {
    type: String,
    trim: true
  },
  soldById: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  soldByRole: {
    type: String,
    trim: true
  },
  soldAt: {
    type: Date
  },
  sellingGST: {
    type: Number,
  },
  sellingGSTValue: {
      type: Number,
  },
  sellingPrice: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0
  },
  discountedPrice: {
      type: Number,
  },
  sellingAt: {
      type: Number
  }
});

