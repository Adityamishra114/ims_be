import mongoose from "mongoose";


export const EmailSchema = new mongoose.Schema(
{ 
    sentTo:{
        type: String
    },
    sentBy:{
        type: String
    },
    subject:{
        type: String
    },
    text:{
        type: String 
    },
    attachments:{
        type: String
    },
    generatedAt:{
        type: Date,
        default: Date.now
    },
    messageId:{
        type: String
    }
}
)