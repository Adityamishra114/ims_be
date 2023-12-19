import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema ({
    
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
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

const PurchasingHistorySchema = new mongoose.Schema ({

    purchaseOrderNo: {
        type: String,
        trim: true
    },
    purchaseOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseOrder"
    },
    totalItems: {
        type: Number,
        default: 0
    },
    subTotal: {
        type: Number,
        default: 0
    },
    extraDiscount: {
        type: Number
    },
    orderTotal: {
        type: Number,
        default: 0
    },
    storeName: {
        type: String,
        trim: true
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
        default: new Date()
    },
    products: [ProductSchema]
    
}, {_id: false})


export const ManufacturerSchema = new mongoose.Schema ({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
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
    pincode: {
        type: String,
        trim: true
    },
    GSTNo: {
        type: String,
        trim: true
    },
    PANNo: {
        type: String,
        trim: true
    },
    purchaseHistory: [PurchasingHistorySchema],
    totalPurchase: {
        type: Number,
        default: 0
    },
    totalPurchaseVal: {
        type: Number,
        default: 0
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
        default: Date.now()
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