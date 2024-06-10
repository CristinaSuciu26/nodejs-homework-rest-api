import express from "express";
import logger from "morgan";
import cors from "cors";
import connectDB from "./config/db.js";
import contactsRouter from "./routes/api/contactsRouter.js";
import usersRouter from "./routes/api/usersRouter.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
console.log("SECRET_KEY:", SECRET_KEY);

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
