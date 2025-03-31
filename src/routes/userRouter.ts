import { Router } from "express";
import bcrypt from "bcrypt";
import { userModel } from "../db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { hasLowerCase, hasNumber, hasSpecialChar, hasUpperCase } from "../zodChecks";
import { JWT_SECRET } from "../config";
import { userMiddleware } from "../middlewares/userMiddleware";
import { requiredSignInBody, requiredSignUpBody, requiredUpdateInfoBody } from "../utils";
export const userRouter = Router();

userRouter.post("/signup", async(req, res) => {
    const { success, error } = requiredSignUpBody.safeParse(req.body);
    if(!success){
        res.json({
            msg: "incorrect credential format, " + error.message
        })
        return;
    }
    const username = req.body.username;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    try {
        const hashPassword = await bcrypt.hash(password, 10);
        
        await userModel.create({
            username: username,
            firstName: firstName,
            lastName: lastName,
            password: hashPassword
        })

        res.status(200).json({
            msg: "user signed up"
        })
        
    } catch (error) {
        res.status(411).json({
            msg: "error" + error
        })
    }
})

userRouter.post("/signin", async(req,res) => {
	const { success, error } = requiredSignInBody.safeParse(req.body);
	if(!success){
		res.json({
			msg: "incorrect credential format for signin, " + error.message
		})
		return;
	}

	const username = req.body.username;
	const password = req.body.password;

	try {
		const user = await userModel.findOne({
			username: username
		})
		if(!user) throw new Error("user not found");

		const isPasswordMatch = await bcrypt.compare(password, user.password);
		if(!isPasswordMatch) throw new Error("password incorrect");

		const userJwtToken = jwt.sign({
			userId: user._id,
		}, JWT_SECRET);

		res.json({
			msg: "signin done",
			token: userJwtToken
		})
	} catch (error) {
		res.status(411).json({
			msg: 'error while signin, ' + error
		})
	}
})

userRouter.put("/update-info", userMiddleware,  async(req,res) => {
	const userId = req.userId;
	const { success, error } = requiredUpdateInfoBody.safeParse(req.body);
	if(!success){
		res.json({
			msg: "incorrect input format, " + error.message
		});
		return;
	}
	
	try {
		await userModel.updateOne({
			_id: userId
		}, req.body);
		
		res.json({
			msg: "upadated the user"
		})
	} catch (error) {
		res.status(411).json({
			msg: error
		})
	}
})

userRouter.get("/bulk", userMiddleware, async(req, res) => {
	const filter = req.query.filter || "";
	// const regex = new RegExp(filter, 'i');

	try {
		//! Approach:1
		// const users = await userModel.find({
		// 	$or: [
		// 		{
		// 			firstName: regex
		// 		},
		// 		{
		// 			lastName: regex
		// 		}
		// 	]
		// }, 'username firstName lastName _id').exec();

		//! Approach:2
		const users = await userModel.find({
			$or: [
				{
					username: { "$regex": filter, "$options": "i" }
				},
				{
					firstName: { "$regex": filter, "$options": "i" }
				},
				{
					lastName: { "$regex": filter, "$options": "i" }
				},
			]
		}, 'username firstName lastName _id')

		res.json({
			users
		})
	} catch (error) {
		res.status(411).json({
			msg: error
		})
	}
})