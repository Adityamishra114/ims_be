import { MaterialsHistorySchema } from "src/engineer-history/schema/engineerHistory.schema";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

export const UserSchema = new mongoose.Schema(
  {
    seq: {
      type: Number,
      default: 1
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    storeName: {
      type: String,
      trim: true
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "store",
    },
    categoryOfEng: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ["admin", "subadmin", "engineer"],
      trim: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      trim: true
    },
    assignedUnderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    // assignedTo: {
    //   type: String,
    // },
    // assignedToId: { 
    //   type: mongoose.Schema.Types.ObjectId, 
    //   ref: "user" 
    // },
    createdBy: {
        type: String,
        trim: true
    },
    createdByRole: {
        type: String,
        trim: true
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user" 
    },
    updatedBy: {
      type: String,
      trim: true
    },
    updatedById: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "user" 
    },
    updatedByRole: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: new Date()
    },
    updatedAt: {
      type: Date
    },
    materialsAsked: [MaterialsHistorySchema],
    asking: {
      type: Boolean,
      default: false
    },
    workingHistory:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "EngineerHistory"
    }
  }
);

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next(); // If password wasn't modified, move to the next middleware
    }

    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

