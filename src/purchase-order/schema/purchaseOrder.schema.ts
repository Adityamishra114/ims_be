import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema ({

    productName: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
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
}, {_id: false})

export const PurchaseOrderSchema = new mongoose.Schema ({

    seq: {
        type: Number,
        default: 1
    },
    purchaseOrderNo: {
        type: String,
        required: true,
        trim: true
    },
    manufacturer: {
        type: String,
        trim: true
    },
    manufacturerId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manufacturer"
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store"
    },
    storeName: {
        type: String,
        trim: true
    },
    products: [ProductSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    subTotal: {
        type: Number,
        default: 0
    },
    extraDiscount: {
        type: Number,
        default: 0
    },
    orderTotal: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
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
        type: Date, 
    },
    boughtBy: {
        type: String,
        trim: true
    },
    boughtById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    boughtByRole: {
        type: String,
        trim: true
    },
    boughtAt: {
        type: Date, 
    }
})
