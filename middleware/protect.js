import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }
  const secretKey = process.env.JWT_SECRET_KEY;

  try {
    const decoded = jwt.verify(token.split(" ")[1], secretKey);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
  next();
};
