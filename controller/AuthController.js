import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req, res) => {
  console.log("login", req.body);

  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email) === false) {
    return res.status(400).json({ message: "Email is invalid" });
  }
  const checkUser = await prisma.admin.findUnique({
    where: {
      email: email,
    },
  });
  if (checkUser === null) {
    return res.status(404).json({ message: "User not found" });
  }
  const isPasswordValid = await bcrypt.compare(password, checkUser.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ userId: checkUser.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  return res.status(200).json({ message: "Login successful", token });
};

export const register = async (req, res) => {
  console.log("register", req.body);

  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email) === false) {
    return res.status(400).json({ message: "Email is invalid" });
  }
  const checkUser = await prisma.admin.findUnique({
    where: {
      email: email,
    },
  });
  if (checkUser !== null) {
    return res.status(409).json({ message: "Email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });
  return res
    .status(201)
    .json({ message: "User created successfully", data: createdUser });
};
