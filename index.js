import "dotenv/config";
import express from "express";
import { login, register } from "./controller/AuthController.js";
import {
  getProduct,
  createProduct,
  deleteProduct,
} from "./controller/ProductController.js";
import { protect } from "./middleware/protect.js";
import cors from "cors";
const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());
app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World!" });
});

app.post("/login", login);
app.post("/register", register);

app.get("/products", protect, getProduct);
app.post("/products", protect, createProduct);
app.delete("/products", protect, deleteProduct);
