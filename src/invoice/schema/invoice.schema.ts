import mongoose from "mongoose"

export const InvoiceSchema = new mongoose.Schema ({

    seq: {
        type: Number,
        default: 1
    },
    invoiceNo: {
        type: String,
        required: true,
        trim: true
    },
    customerId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    productIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store"
    },
    storeName: {
        type: String,
        trim: true
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
    soldBy: {
        type: String,
        trim: true
    },
    soldById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    soldByRole: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date, 
        default: new Date()
    },
    permitted: {
        type: Boolean,
        default: false
    }
})
