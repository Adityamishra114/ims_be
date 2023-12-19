const mongoose = require("mongoose");

export const StoreSchema = new mongoose.Schema(
  {
    seq: {
      type: Number,
      default: 1
    },
    storeName: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    shopLocation: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    subAdmins: [{
      type: String,
      trim: true
    }],
    subAdminsIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    engineers: [{
      type: String,
      trim: true
    }],
    engineersIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    productIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }],
    GSTNo: {
      type: String,
      trim: true
    },
    PANNo:{
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: new Date()
    },
    createdBy: {
      type: String
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedAt: {
      type: Date
    },
    updatedBy: {
      type: String
    },
    updatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  }
);

