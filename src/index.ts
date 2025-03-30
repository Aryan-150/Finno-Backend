import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { DB_NAME, DB_URL, PORT } from "./config";
import { mainRouter } from "./routes/mainRouter";

const app = express();
app.use(express.json());
app.use(cors());

declare global {
    namespace Express {
        interface Request {
            userId ?: mongoose.Types.ObjectId
        }
    }
}

app.use("/api/v1", mainRouter);

async function main() {
    await mongoose.connect(`${DB_URL}/${DB_NAME}`);
    console.log('db connected');
    app.listen(PORT, () => {
        console.log('server is listeniong at port: ' + PORT);
    })
}

main();