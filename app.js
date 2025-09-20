import express from "express";
import morgan from "morgan";
import cors from "cors";

import authRouter from "./routes/authRouter.js";
import contactsRouter from "./routes/contactsRouter.js";
import { connectToDatabase, sequelize } from "./db/connection.js";
import "./models/User.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/contacts", contactsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const startServer = async () => {
  await connectToDatabase();
  await sequelize.sync();
  app.listen(3000, () => {
    console.log("Server is running. Use our API on port: 3000");
  });
};

startServer();

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU4MzM5MTkwLCJleHAiOjE3NTg0MjU1OTB9.Ly2mUWtuji65QKUQtCh9rJf2cK0xzXMcmhjZQuCJCfg;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU4MzM5MjQzLCJleHAiOjE3NTg0MjU2NDN9.sSLp1l_79Y7ZkLhx6tBcJ7GVl7nO7cad0_0RF - LXAck;
