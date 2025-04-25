import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session, { Session, SessionData } from "express-session";
import { DB_NAME, DB_URL, PORT } from "./config";
import { mainRouter } from "./routes/mainRouter";

type User = {
    username: string;
    firstName: string;
    lastName: string;
}

declare module 'express-session' {
    interface SessionData {
      token: string;    // extend the sessionData with token
      userId ?: mongoose.Types.ObjectId;
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
app.use(cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    credentials: true, // Allow credentials (cookies)
}));
app.use(session({
    secret: "shhh, very secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
}))
app.use("/api/v1", mainRouter);

async function main() {
    await mongoose.connect(`${DB_URL}/${DB_NAME}`);
    console.log('db connected');
    app.listen(PORT, () => {
        console.log('server is listeniong at port: ' + PORT);
    })
}

main();