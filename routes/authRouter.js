import express from "express";
import {
  register,
  login,
  logout,
  getCurrent,
} from "../controllers/authControllers.js";
import auth from "../middlewares/auth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", auth, logout);
authRouter.get("/current", auth, getCurrent);

export default authRouter;
