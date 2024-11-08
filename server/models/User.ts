// import { model } from "mongoose";

import mongoose, { model } from 'mongoose';


const Schema = mongoose.Schema;
const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    userPswrd: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    savedStocks: {
        type: Array,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const User = model("User", UserSchema);