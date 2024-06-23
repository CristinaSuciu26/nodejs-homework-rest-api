import express from "express";
import UsersService from "../../models/usersService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../../middleware/authMiddleware.js";
import Jimp from "jimp";
import upload from "../../config/multer.js";
import { promises as fsPromises } from "fs";
import sendEmail from "../../config/sendgrid.js";
import { v4 as uuidv4 } from "uuid";

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
    const verificationToken = uuidv4();
    console.log("Generated verificationToken:", verificationToken);

    const newUser = await UsersService.createUser({
      email,
      password: hashedPassword,
      verificationToken,
    });
    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/users/verify/${verificationToken}`;
    const subject = "Verify your email";
    const text = `Please verify your email by clicking the following link: ${verificationUrl}`;
    const html = `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`;
    await sendEmail(email, subject, text, html);

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

// verify/:verificationToken
usersRouter.get("/verify/:verificationToken", async (req, res) => {
  const { verificationToken } = req.params;

  try {
    const user = await UsersService.findUserByVerificationToken(
      verificationToken
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await UsersService.verifyUser(user._id);

    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

// users/verify/
usersRouter.post("/verify", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    const user = await UsersService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationToken = uuidv4();

    user.verificationToken = verificationToken;
    await user.save();

    const verificationUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/users/verify/${verificationToken}`;
    const subject = "Verify your email";
    const text = `Please verify your email by clicking the following link: ${verificationUrl}`;
    const html = `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`;
    await sendEmail(email, subject, text, html);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({ message: `Error: ${error.message}` });
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
    if (!existingUser.verify) {
      return res.status(401).json({ message: "Email not verified yet" });
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
