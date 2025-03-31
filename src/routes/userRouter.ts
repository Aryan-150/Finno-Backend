import { Router } from "express";
import bcrypt from "bcrypt";
import { userModel } from "../db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { hasLowerCase, hasNumber, hasSpecialChar, hasUpperCase } from "../zodChecks";
import { JWT_SECRET } from "../config";
import { userMiddleware } from "../middlewares/userMiddleware";
export const userRouter = Router();

userRouter.post("/signup", async(req, res) => {
	const requiredSignUpData = z.object({
		username: z.string().min(3).max(30).toLowerCase().trim(),
		firstName: z.string().max(50).trim(),
		lastName: z.string().max(50).trim(),
		password: z.string().min(8)
			.refine(hasLowerCase, 'password must contain atleast a lowercase letter')
			.refine(hasUpperCase, "password must contain atleast a uppercase letter")
			.refine(hasSpecialChar, "password must contain atleast a special character")
			.refine(hasNumber, "password must contain atleast a number")
	})

    const parsedSignUpData = requiredSignUpData.safeParse(req.body);
    if(!parsedSignUpData.success){
        res.json({
            msg: "incorrect credential format, " + parsedSignUpData.error.message
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
	const requiredSignInBody = z.object({
		username: z.string().min(3).max(30).toLowerCase().trim(),
		password: z.string().min(8)
		.refine(hasLowerCase, '')
		.refine(hasUpperCase, '')
		.refine(hasSpecialChar, '')
		.refine(hasNumber, '')
	})

	const parsedSignInData = requiredSignInBody.safeParse(req.body);
	if(!parsedSignInData.success){
		res.json({
			msg: "incorrect credential format for signin, " + parsedSignInData.error.message
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

	const requiredUpdateCredentialsBody = z.object({
		firstName: z.string().max(50).trim().optional(),
		lastName: z.string().max(50).trim().optional(),
		password: z.string().min(8)
		.refine(hasLowerCase, '')
		.refine(hasUpperCase, '')
		.refine(hasSpecialChar, '')
		.refine(hasNumber, '')
		.optional()
	})

	const { success, error } = requiredUpdateCredentialsBody.safeParse(req.body);
	if(!success){
		res.json({
			msg: "incorrect input format, " + error.message
		});
		return;
	}
	
	try {
		// const user = await userModel.findOne({
		// 	_id: userId
		// });
		// if(!user) throw new Error("user not found");

		await userModel.updateOne({_id: userId}, req.body);

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