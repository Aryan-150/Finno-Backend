import { Router } from "express";
import { userMiddleware } from "../middlewares/userMiddleware";
import { Accounts } from "../db";
import { requiredTransferBody } from "../utils";
import mongoose from "mongoose";
export const accountRouter = Router();

accountRouter.get("/balance",userMiddleware, async(req,res) => {
    const userId = req.session.userId;

    try {
        const user = await Accounts.findOne({
            userId: userId
        })
        if(!user) throw new Error("user for userId not found");

        res.status(200).json({
            balance: user.balance
        })
    } catch (error) {
        res.status(411).json({ error });
    }
})

accountRouter.post("/transfer",userMiddleware, async(req,res) => {
    const { success, error } = requiredTransferBody.safeParse(req.body);
    if(!success){
        res.json({
            msg: error.message
        })
        return;
    }

    const to = req.body.to;
    const amount = req.body.amount;
    const userId = req.session.userId;

    try {
        const session = await mongoose.startSession();

        session.startTransaction();
        const fromAccount = await Accounts.findOne({ userId: userId }).session(session);
        if(!fromAccount || (fromAccount?.balance as Number) < amount){
            await session.abortTransaction();
            res.json({
                msg: "insufficient balance"
            })
            return;
        }
        const toAccount = await Accounts.findOne({ userId: to }).session(session);
        if(!toAccount || toAccount.userId === fromAccount.userId){
            await session.abortTransaction();
            res.json({
                msg: "account does not exist, or both accounts are same"
            })
            return;
        }
        
        // perform the transactions:
        await Accounts.findOneAndUpdate(
            { _id: fromAccount._id },
            { $inc: { balance: -amount } }
        ).session(session)

        await Accounts.findOneAndUpdate(
            { _id: toAccount._id }, 
            { $inc: { balance: amount } }
        ).session(session)

        res.json({
            msg: "transaction completed"
        })
        await session.commitTransaction();

    } catch (error) {
        res.status(400).json({
            error
        })
    }
})

accountRouter.get("/all", async(req,res) => {
    try {
        const allAccounts = await Accounts.find().populate("userId", "username");
        if(!allAccounts) throw new Error("error while hitting the database");
        
        res.json({
            allAccounts
        })
    } catch (error) {
        res.status(411).json({
            msg: error
        })
    }
})