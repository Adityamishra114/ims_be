import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema ({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    productName: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    category: {
        type: String
    },
    GST: {
        type: Number,
    },
    GSTValue: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    discountedPrice: {
        type: Number,
    },
    sellingPrice: {
        type: Number
    },
    sellingAt: {
        type: Number
    },
    quantity: {
        type: String,
        trim: true
    }
}, {_id: false, timestamps: true})

export const BucketSchema = new mongoose.Schema ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username: {
        type: String,
        trim: true
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
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date
    }
})