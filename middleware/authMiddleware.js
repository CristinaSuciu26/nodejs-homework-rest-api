import jwt from "jsonwebtoken";
import UsersService from "../models/usersService.js";

const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Not authorized - No auth header" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Received token:", token);

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded token:", decoded);

    const user = await UsersService.getUserById(decoded.id);
    console.log("Found user:", user);

    if (!user) {
      console.log("User not found:", decoded.id);
      return res
        .status(401)
        .json({ message: "Not authorized - User not found" });
    }

    if (user.token !== token) {
      console.log(
        "Token mismatch. Stored token:",
        user.token,
        "Received token:",
        token
      );
      return res
        .status(401)
        .json({ message: "Not authorized - Token mismatch" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error during authorization:", error);
    return res.status(401).json({ message: "Not authorized - Invalid token" });
  }
};

export default authMiddleware;
