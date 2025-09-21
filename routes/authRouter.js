import express from "express";
import {
  register,
  login,
  logout,
  getCurrent,
} from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";

import {
  registerSchema,
  loginSchema,
  subscriptionSchema,
} from "../schemas/authSchemas.js";

import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

import { updateAvatar } from "../controllers/authControllers.js";

const authRouter = express.Router();

authRouter.patch(
  "/subscription",
  auth,
  validateBody(subscriptionSchema),
  async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      const { subscription } = req.body;
      user.subscription = subscription;
      await user.save();
      res.status(200).json({
        email: user.email,
        subscription: user.subscription,
      });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.patch("/avatars", auth, upload.single("avatar"), updateAvatar);
authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/logout", auth, logout);
authRouter.get("/current", auth, getCurrent);

export default authRouter;
