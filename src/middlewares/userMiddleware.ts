import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Users } from "../db";

export const userMiddleware = async(req: Request,res: Response,next: NextFunction) => {
    const token = req.headers.authorization as string;

    try {
        const decodedInfo = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await Users.findOne({
            _id: decodedInfo.userId
        });
        if(!user) throw new Error("user not found");

        req.userId = user._id;
        next();
    } catch (error) {
        res.status(403).json({
            msg: "token auth error, " + error
        })
    }
}