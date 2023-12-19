const mongoose = require("mongoose");

export const CatPahseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },
    categoryPhases: [{
        type: String,
        trim: true
    }],
    storeName: {
      type: String
    },
    createdAt: {
      type: Date,
      default: new Date()
    },
    createdBy: {
      type: String,
      trim: true
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdByRole: {
      type: String,
      trim: true
    },
    updatedAt: {
      type: Date
    },
    updatedBy: {
      type: String,
      trim: true
    },
    updatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedByRole: {
      type: String,
      trim: true
    },
  }
);

