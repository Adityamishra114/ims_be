import mongoose from "mongoose";

export const MaterialsSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number
    },
    storeName: {
        type: String,
        trim: true
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
    createdAt: {
        type: Date,
        default: new Date()
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
    updatedAt: {
        type: Date
    }
})