import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session, { Session, SessionData } from "express-session";
import { DB_NAME, DB_URL, PORT } from "./config";
import { mainRouter } from "./routes/mainRouter";

declare module 'express-session' {
    interface SessionData {
      token: string;    // extend the sessionData with token
    }
}
  
declare global {
    namespace Express {
        interface Request {
            userId ?: mongoose.Types.ObjectId,
            session: Session & Partial<SessionData>
        }
    }
}

const app = express();
app.use(express.json());
app.use(cors());
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