import { Router } from "express";
import {z} from "zod";
import bcrypt from "bcrypt";
import { hasLowerCase, hasNumber, hasSpecialChar, hasUpperCase } from "../zodChecks";
import { userModel } from "../db";
export const userRouter = Router();

userRouter.post("/signup", async(req, res) => {
    const requiredBody = z.object({
        username: z.string().trim().min(3).max(30).toLowerCase(),
        firstName: z.string().max(50),
        lastName: z.string().max(50),
        password: z.string().min(8)
        .refine(hasLowerCase, 'password must contain atleast a lowercase letter')
        .refine(hasUpperCase, "password must contain atleast a uppercase letter")
        .refine(hasSpecialChar, "password must contain atleast a special character")
        .refine(hasNumber, "password must contain atleast a number")
    })

    const parsedData = requiredBody.safeParse(req.body)
    if(!parsedData.success){
        console.log("zod error");
        
        res.json({
            msg: "incorrect credential format, " + parsedData.error.message
        })
        return;
    }
    console.log(parsedData.data);
    
    const username = req.body.username;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    console.log('req.body has reached');
    

    try {
        const hashPassword = await bcrypt.hash(password, 10);
        console.log('password hashed');
        
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

userRouter.post("/signin", (req,res) => {
    
})