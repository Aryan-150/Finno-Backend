import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String, required: true, unique: true, trim: true, lowercase: true, minLength: 5, maxLength: 30
    },
    firstName: {
        type: String, required: true, trim: true, maxLength: 50
    },
    lastName: {
        type: String, required: true, trim: true, maxLength: 50
    },
    password: {
        type: String, required: true, minLength: 8
    }
})

export const userModel = mongoose.model('users', userSchema);
