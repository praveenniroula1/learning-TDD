import { PrismaClient } from "@prisma/client";
import { redisClient } from "../../redis.js"; // Use the redisClient from the redis.js file

const prisma = new PrismaClient();
import express from "express";
const userRouter = express.Router();

userRouter.post("/", async (req, res) => {
  try {
    const { name, password, email } = req.body;
    console.log(name, password, email);

    const insertUser = await prisma.user.create({
      data: { name, password, email },
    });

    const cacheKey = `user:${insertUser.id}`;
    await redisClient.set(cacheKey, JSON.stringify(insertUser), "EX", 3600); // Use redisClient

    return res.json({
      status: true,
      message: "successfully created user",
      insertUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Error creating user" });
  }
});

userRouter.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    console.log(email);

    const findUser = await prisma.user.findUnique({
      where: { email: email },
    });

    return res.json({
      status: true,
      message: "successfully found user",
      findUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Error fetching user" });
  }
});

userRouter.patch("/", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log(email);

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { password: newPassword },
    });

    return res.json({
      status: true,
      message: "successfully updated user",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Error updating user" });
  }
});

userRouter.delete("/", async (req, res) => {
  try {
    const { id } = req.query;
    const deleteUser = await prisma.user.delete({
      where: { id: parseInt(id, 10) },
    });

    return res.json({
      status: true,
      message: "successfully deleted user",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: false, message: "Error deleting user" });
  }
});

userRouter.get("/all", async (req, res) => {
  try {
    const cacheKey = "users:all";

    // Check if users are cached in Redis
    const cachedUsers = await redisClient.get(cacheKey);
    if (cachedUsers) {
      return res.json({
        status: true,
        message: "Fetched users from cache",
        users: JSON.parse(cachedUsers),
      });
    }

    // If not cached, fetch from the database
    const findAllUsers = await prisma.user.findMany();

    if (findAllUsers.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No users found",
      });
    }

    // Use a pipeline to efficiently cache the results
    const pipeline = redisClient.pipeline();
    pipeline.set(cacheKey, JSON.stringify(findAllUsers), "EX", 3600);
    findAllUsers.forEach(user => {
      const userCacheKey = `user:${user.id}`;
      pipeline.set(userCacheKey, JSON.stringify(user), "EX", 3600);
    });
    await pipeline.exec();

    return res.json({
      status: true,
      message: "Successfully fetched all users",
      users: findAllUsers,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Error fetching users" });
  }
});


export default userRouter;
