import { Router } from "express";
import { userRouter } from "./userRouter";
import { accountRouter } from "./accountRouter";
export const mainRouter = Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/account", accountRouter);

mainRouter.get("/health-check", (req, res) => {
  res.status(200).json({
    msg: "hii there"
  })
});