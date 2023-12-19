import mongoose from "mongoose"

export const BuyerDetailsSchema = new mongoose.Schema ({

    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    pincode: {
        type: String
    },
    GSTNo: {
        type: String
    },
    PANNo: {
        type: String
    },
    invoices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice"
    }]
}, {timestamps: true})
