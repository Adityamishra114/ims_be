import mongoose from "mongoose";

export interface TimeInterface {
    storeName: String
    month: Number
    year: Number
    income: String
    expense: String
    damagedGoods: String
    movedFrom: String
    movedTo: String
}