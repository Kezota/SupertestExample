import request from "supertest";
import express from "express";
import {
  getProduct,
  createProduct,
  deleteProduct,
} from "../controller/ProductController.js";
import { protect } from "../middleware/protect.js";

const app = express();
app.use(express.json());
app.get("/products", protect, getProduct);
app.post("/products", protect, createProduct);
app.delete("/products", protect, deleteProduct);

// Mock the protect middleware to bypass authentication for testing
jest.mock("../middleware/protect.js", () => ({
  protect: (req, res, next) => next(),
}));

describe("ProductController", () => {
  describe("GET /products", () => {
    it("should retrieve all products", async () => {
      const res = await request(app).get("/products");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty(
        "message",
        "Products retrieved successfully"
      );
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const res = await request(app).post("/products").send({
        name: "Product1",
        stock: 10,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty(
        "message",
        "Product created successfully"
      );
      expect(res.body).toHaveProperty("data");
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app).post("/products").send({
        stock: 10,
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", "Name is required");
    });

    it("should return 400 if stock is missing", async () => {
      const res = await request(app).post("/products").send({
        name: "Product1",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", "Stock is required");
    });

    it("should return 400 if stock is not a number", async () => {
      const res = await request(app).post("/products").send({
        name: "Product1",
        stock: "not-a-number",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", "Stock must be a number");
    });
  });

  describe("DELETE /products", () => {
    it("should delete a product", async () => {
      await request(app).post("/products").send({
        name: "ProductToDelete",
        stock: 10,
      });
      const res = await request(app).delete("/products").send({
        name: "ProductToDelete",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty(
        "message",
        "Product deleted successfully"
      );
      expect(res.body).toHaveProperty("data");
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app).delete("/products").send({});
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message", "Name is required");
    });

    it("should return 404 if product does not exist", async () => {
      const res = await request(app).delete("/products").send({
        name: "NonExistentProduct",
      });
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("message", "Product not found");
    });
  });
});
