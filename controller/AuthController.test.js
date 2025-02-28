import express from "express";
import { login, register } from "../controller/AuthController.js";
import { jest } from "@jest/globals";

const app = express();
app.use(express.json());
app.post("/login", login);
app.post("/register", register);

describe("AuthController", () => {
  describe("POST /register", () => {
    it("should register a new user", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
      });
    });

    it("should return 400 if email is missing", async () => {
      const req = { body: { password: "password123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is required" });
    });

    it("should return 400 if password is missing", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password is required",
      });
    });

    it("should return 400 if email is invalid", async () => {
      const req = { body: { email: "invalid-email", password: "password123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is invalid" });
    });

    it("should return 409 if email already exists", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await register(req, res);
      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already exists",
      });
    });
  });

  describe("POST /login", () => {
    it("should login an existing user", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await register(req, res);
      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          token: expect.any(String),
        })
      );
    });

    it("should return 400 if email is missing", async () => {
      const req = { body: { password: "password123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is required" });
    });

    it("should return 400 if password is missing", async () => {
      const req = { body: { email: "test@example.com" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password is required",
      });
    });

    it("should return 400 if email is invalid", async () => {
      const req = { body: { email: "invalid-email", password: "password123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is invalid" });
    });

    it("should return 404 if user is not found", async () => {
      const req = {
        body: { email: "nonexistent@example.com", password: "password123" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 401 if password is incorrect", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await register(req, res);
      req.body.password = "wrongpassword";
      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid password" });
    });
  });
});
