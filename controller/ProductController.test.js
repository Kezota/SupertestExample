import express from "express";
import { login, register } from "../controller/AuthController.js";
import {
  getProduct,
  createProduct,
  deleteProduct,
} from "../controller/ProductController.js";
import { protect } from "../middleware/protect.js";
import { jest } from "@jest/globals";

const app = express();
app.use(express.json());
app.post("/login", login);
app.post("/register", register);
app.get("/products", protect, getProduct);
app.post("/products", protect, createProduct);
app.delete("/products", protect, deleteProduct);

// Mock the protect middleware to bypass authentication for testing
jest.mock("../middleware/protect.js", () => ({
  protect: (req, res, next) => next(),
}));

let token;

beforeAll(async () => {
  // Register a new user
  await request(app).post("/register").send({
    email: "test@example.com",
    password: "password123",
  });

  // Login to get the token
  const res = await request(app).post("/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = res.body.token;
});

describe("ProductController", () => {
  describe("GET /products", () => {
    it("should retrieve all products", async () => {
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Products retrieved successfully",
          data: expect.any(Array),
        })
      );
    });
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const req = {
        headers: { authorization: `Bearer ${token}` },
        body: { name: "Product1", stock: 10 },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product created successfully",
          data: expect.any(Object),
        })
      );
    });

    it("should return 400 if name is missing", async () => {
      const req = {
        headers: { authorization: `Bearer ${token}` },
        body: { stock: 10 },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Name is required" });
    });

    it("should return 400 if stock is missing", async () => {
      const req = {
        headers: { authorization: `Bearer ${token}` },
        body: { name: "Product1" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Stock is required" });
    });

    it("should return 400 if stock is not a number", async () => {
      const req = {
        headers: { authorization: `Bearer ${token}` },
        body: { name: "Product1", stock: "not-a-number" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Stock must be a number",
      });
    });
  });

  describe("DELETE /products", () => {
    it("should delete a product", async () => {
      const reqCreate = {
        headers: { authorization: `Bearer ${token}` },
        body: { name: "ProductToDelete", stock: 10 },
      };
      const resCreate = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await createProduct(reqCreate, resCreate);

      const reqDelete = {
        headers: { authorization: `Bearer ${token}` },
        body: { name: "ProductToDelete" },
      };
      const resDelete = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await deleteProduct(reqDelete, resDelete);

      expect(resDelete.status).toHaveBeenCalledWith(200);
      expect(resDelete.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product deleted successfully",
          data: expect.any(Object),
        })
      );
    });

    it("should return 400 if name is missing", async () => {
      const req = {
        headers: { authorization: `Bearer ${token}` },
        body: {},
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Name is required" });
    });

    it("should return 404 if product does not exist", async () => {
      const req = {
        headers: { authorization: `Bearer ${token}` },
        body: { name: "NonExistentProduct" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });
  });
});
