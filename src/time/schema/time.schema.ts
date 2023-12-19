import mongoose from "mongoose";

export const TimeSchema  = new mongoose.Schema({
    storeName: {
        type: String,
        trim: true
    },
    month: {
        type: Number
    },
    year: {
        type: Number
    },
    income: {
        type: String,
        trim: true,
        default: "0"
    },
    expense: {
        type: String,
        trim: true,
        default: "0"
    },
    damagedGoods: {
        type: String,
        trim: true,
        default: "0"
    },
    movedFrom: {
        type: String,
        trim: true,
        default: "0"
    },
    movedTo: {
        type: String,
        trim: true,
        default: "0"
    },
})