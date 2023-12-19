import mongoose from "mongoose";

const StageInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    value: {
        type: String
    }
})

export const StagesSchema = new mongoose.Schema ({
    storeName: {
        type: String
    },
    stages: [StageInfoSchema]
})