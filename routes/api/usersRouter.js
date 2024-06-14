import express from "express";
import UsersService from "../../models/usersService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../../middleware/authMiddleware.js";
import Jimp from "jimp";
import upload from "../../config/multer.js";
import { promises as fsPromises } from "fs";

const usersRouter = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Signup
usersRouter.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await UsersService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UsersService.createUser({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    console.error("Error processing user signup request:", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// Login
usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UsersService.findUserByEmail(email);
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: existingUser._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    const updatedUser = await UsersService.updateUserToken(
      existingUser._id,
      token
    );
    console.log("Updated user with token:", updatedUser);

    return res.status(200).json({
      token,
      user: {
        email: existingUser.email,
        subscription: existingUser.subscription,
      },
    });
  } catch (error) {
    console.error("Error processing user login request:", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// Logout
usersRouter.get("/logout", authMiddleware, async (req, res) => {
  try {
    const user = await UsersService.getUserById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await UsersService.updateUserToken(req.user._id, null);

    return res.status(204).json({ message: "Successfully logged out" });
  } catch (error) {
    console.error("Error processing user logout request:", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// Current
usersRouter.get("/current", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    return res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Error fetching current user data:", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// Avatars
usersRouter.patch(
  "/avatars",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;
      const image = await Jimp.read(filePath);
      await image.resize(250, 250).writeAsync(filePath);

      const avatarFileName = `${req.user._id}-${req.file.filename}`;
      const targetPath = `public/avatars/${avatarFileName}`;
      await fsPromises.rename(filePath, targetPath);

      const avatarURL = `/avatars/${avatarFileName}`;
      const updatedUser = await UsersService.updateUserAvatar(
        req.user._id,
        avatarURL
      );

      return res.status(200).json({ avatarURL });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return res.status(500).json({ message: `Error: ${error.message}` });
    }
  }
);
export default usersRouter;
