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

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Users",
        unique: true,
        required: true
    },
    balance: {
        type: Number, required: true
    }
})

export const Users = mongoose.model('Users', userSchema);
export const Accounts = mongoose.model('Accounts', accountSchema);
