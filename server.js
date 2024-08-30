import "dotenv/config"
import express from "express";
const app = express();
app.use(express.json());


import userRouter from "./components/routers/userRouter.js";
app.use("/api/v1/users", userRouter);

const port = 8000;
app.listen(port, () => {
  `app is listening to ${port}`;
});
