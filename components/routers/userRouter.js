import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import express from "express";
const userRouter = express.Router();

userRouter.post("/", async (req, res) => {
  try {
    const { name, password, email } = req.body;
    console.log(name, password, email);

    const insertUser = await prisma.user.create({
      data: {
        name,
        password,
        email,
      },
    });
    return res.json({
      status: true,
      message: "successfully created user",
      insertUser,
    });
  } catch (error) {
    console.log(error);
  }
});
userRouter.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    console.log(email);

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return res.json({
      status: true,
      message: "successfully created user",
      findUser,
    });
  } catch (error) {
    console.log(error);
  }
});

// let password change to the user
userRouter.patch("/", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log(email);

    const updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: newPassword,
      },
    });
    return res.json({
      status: true,
      message: "successfully updated user",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
  }
});

userRouter.delete("/", async (req, res) => {
  try {
    const { id } = req.query;
    const deleteUser = await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    return res.json({
      status: true,
      message: "successfully deleted user",
    });
  } catch (error) {
    console.log(error);
  }
});

userRouter.get("/all", async (req, res) => {
  try {
    const findAlluser = await prisma.user.findMany();
    return res.json({
      status: true,
      message: "successfully fetched all user",
      users: findAlluser,
    });
  } catch (error) {
    console.log(error);
  }
});

export default userRouter;
