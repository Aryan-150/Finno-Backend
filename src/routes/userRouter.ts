import { Router } from "express";
import bcrypt from "bcrypt";
import { Accounts, Users } from "../db";
import jwt from "jsonwebtoken";
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

		const isUserNameExist = await Users.findOne({
			username: username
		})

		if(isUserNameExist) throw new Error("user with given username already exists, try different username");
        
        const user = await Users.create({
            username: username,
            firstName: firstName,
            lastName: lastName,
            password: hashPassword
        })

		await Accounts.create({
			userId: user._id
		})

        res.status(200).json({
            msg: "user signed up with account"
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
		const user = await Users.findOne({
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
		await Users.updateOne({
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
		// const users = await Users.find({
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
		const users = await Users.find({
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