import "dotenv/config";
import express from "express";
const app = express();
app.use(express.json());

import { redisClient } from "./redis.js"; // Import the Redis client
import userRouter from "./components/routers/userRouter.js"; // Import your routes
app.use("/api/v1/users", userRouter); // Use the router

const port = 8000;
app.listen(port, () => {
  console.log(`app is listening to ${port}`);
});
