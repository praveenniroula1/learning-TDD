// __tests__/userRouter.test.js

import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";
import userRouter from "./components/routers/userRouter";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use("/api/v1/users", userRouter);

describe("User routes", () => {
  beforeAll(async () => {
    // Seed the database with test data
    await prisma.user.createMany({
      data: [
        { name: "User1", email: "user1@example.com", password: "password1" },
        { name: "User2", email: "user2@example.com", password: "password2" },
      ],
    });
  });

  afterAll(async () => {
    // Clean up the database after tests
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("GET /api/v1/users/all", () => {
    it("should return all users", async () => {
      const response = await request(app).get("/api/v1/users/all");

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.users[0]).toHaveProperty("name");
      expect(response.body.users[0]).toHaveProperty("email");
    });
  });

  describe("GET /api/v1/users", () => {
    it("should return one user based on email", async () => {
      const response = await request(app)
        .get("/api/v1/users")
        .query({ email: "user1@example.com" });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.findUser).toBeDefined();
      expect(response.body.findUser).toHaveProperty("name", "User1");
      expect(response.body.findUser).toHaveProperty(
        "email",
        "user1@example.com"
      );
      expect(response.body.findUser).toHaveProperty("password");
    });
  });

  describe("POST /api/v1/users", () => {
    it("should register the user in the database", async () => {
      const response = await request(app).post("/api/v1/users").send({
        name: "testingName",
        email: "testingEmail@gmail.com",
        password: "testingPassword",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("successfully created user");
      expect(response.body.insertUser).toBeDefined();
      expect(response.body.insertUser).toHaveProperty("id");
      expect(response.body.insertUser).toHaveProperty(
        "email",
        "testingEmail@gmail.com"
      );
      expect(response.body.insertUser).toHaveProperty("name", "testingName");
      expect(response.body.insertUser).toHaveProperty("password");
    });
  });

  describe("PATCH /api/v1/users", () => {
    it("should update the user's password", async () => {
      // Seed the database with a test user
      const user = await prisma.user.create({
        data: {
          name: "UserToUpdate",
          email: "update@example.com",
          password: "oldPassword",
        },
      });

      const response = await request(app).patch("/api/v1/users").send({
        email: "update@example.com",
        newPassword: "newPassword",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("successfully updated user"); // Adjusted message
      expect(response.body.updatedUser).toBeDefined();
      expect(response.body.updatedUser).toHaveProperty(
        "email",
        "update@example.com"
      );
      expect(response.body.updatedUser).toHaveProperty(
        "password",
        "newPassword"
      );

      // Verify the password was updated in the database
      const updatedUser = await prisma.user.findUnique({
        where: { email: "update@example.com" },
      });

      expect(updatedUser.password).toBe("newPassword");

      // Clean up the test user
      await prisma.user.delete({
        where: { email: "update@example.com" },
      });
    });
  });

  describe("DELETE /api/v1/users", () => {
    it("should delete the user based on id received via query", async () => {
      const userToDelete = await prisma.user.create({
        data: {
          name: "UserToDelete",
          email: "delete@example.com",
          password: "deletePassword",
        },
      });

      const response = await request(app)
        .delete("/api/v1/users")
        .query({ id: userToDelete.id });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("successfully deleted user");

      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id },
      });

      expect(deletedUser).toBeNull();
    });
  });
});
