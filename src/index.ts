import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session, { Session, SessionData } from "express-session";
import { mainRouter } from "./routes/mainRouter";

type User = {
    username: string;
    firstName: string;
    lastName: string;
}

declare module 'express-session' {
    interface SessionData {
        token: string;    // extend the sessionData with token
        userId?: mongoose.Types.ObjectId;
        user: User
    }
}

declare global {
    namespace Express {
        interface Request {
            session: Session & Partial<SessionData>
        }
    }
}

const app = express();
app.use(express.json());
const whitelist = ['https://finno.aryanbachchu.tech', 'http://localhost:5173']

app.use(cors({
    origin: function (origin, callback) {
        if (origin && whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true, // Allow credentials (cookies)
}));
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
}));
app.use("/api/v1", mainRouter);

async function main() {
    await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
    console.log('db connected');

    app.listen(process.env.PORT, () => {
        console.log('server is listening at port: ' + process.env.PORT);
    })
}

main();