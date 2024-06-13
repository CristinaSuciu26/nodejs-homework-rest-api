import express from "express";
import logger from "morgan";
import cors from "cors";
import connectDB from "./config/db.js";
import contactsRouter from "./routes/api/contactsRouter.js";
import usersRouter from "./routes/api/usersRouter.js";
import dotenv from "dotenv";
import upload from "./config/multer.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/avatars", express.static(path.join(__dirname, "public/avatars")));

app.post("/api/upload-avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
connectDB();
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
