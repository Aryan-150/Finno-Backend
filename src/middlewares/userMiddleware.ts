import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Users } from "../db";

export const userMiddleware = async(req: Request ,res: Response,next: NextFunction) => {
    // const token = req.headers.authorization as string;
    const token = req.session.token;
    // console.log(token);

    try {
        if(!token) throw new Error("token not found");
        
        const decodedInfo = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await Users.findOne({
            _id: decodedInfo.userId
        });
        if(!user) throw new Error("user not found");

        req.session.userId = user._id;
        next();
    } catch (error) {
        res.status(403).json({
            msg: "token auth error: " + error
        })
    }
}