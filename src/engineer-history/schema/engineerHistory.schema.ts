import { IsString } from "class-validator";
import mongoose from "mongoose";

export const MaterialsHistorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    quantity: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        trim: true
    }
}, {_id: false})

const ProductsSchema = new mongoose.Schema ({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    productsName:{
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    assignedBy:{
        type: String,
        trim: true
    },
    assignedById:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    assignedByRole:{
        type: String,
        trim: true
    },
    task: {
        type: String,
        trim: true
    },
    phase: {
        type: String,
        trim: true
    },
    assignedAt: {
        type: Number
    },
    dueDate: {
        type: Number
    },
    closedAt: {
        type: Number
    },
    duration: {
        type: Number
    },
    completed: {
        type: String,
        enum: ['ontime', 'overdue'],
        trim: true
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        trim: true
    },
    remark: {
        type: String,
        trim: true
    },
    materialsUsed: [MaterialsHistorySchema]
}, {_id: false})


export const WorkingHistorySchema = new mongoose.Schema ({
    materialsAssigned: [MaterialsHistorySchema],
    materialsUsed: [MaterialsHistorySchema],
    materialsAvailable: [MaterialsHistorySchema],
    totalProducts: {
        type: Number,
        default: 0
    },
    successProducts: {
        type: Number,
        default: 0
    },
    failedProducts: {
        type: Number,
        default: 0
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
    },
    date: {
        type: String,
        trim: true
    },
    products: [ProductsSchema]
}, {_id: false})


export const EngineerHistorySchema = new mongoose.Schema ({
    workingHistory: [WorkingHistorySchema]
})