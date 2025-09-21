import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  findUserByEmail,
  createUser,
  updateUserToken,
  clearUserToken,
} from "../services/authServices.js";
import gravatar from "gravatar";
import HttpError from "../helpers/HttpError.js";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const avatarsDir = path.resolve("public", "avatars");

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw HttpError(400, "Missing required fields");
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw HttpError(409, "Email in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, true);

    const newUser = await createUser({
      email,
      password: hashedPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw HttpError(400, "Missing required fields");
    }

    const user = await findUserByEmail(email);
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw HttpError(401, "Email or password is wrong");
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "24h" });

    await updateUserToken(user, token);

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw HttpError(401, "Not authorized");
    }

    await clearUserToken(user);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getCurrent = async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      email: user.email,
      subscription: user.subscription,
      avatarURL: user.avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const { file, user } = req;
    if (!file) {
      throw HttpError(400, "Avatar file is required");
    }
    const ext = path.extname(file.originalname);
    const fileName = `${user.id}_${Date.now()}${ext}`;
    const destPath = path.join(avatarsDir, fileName);
    await fs.rename(file.path, destPath);
    const avatarURL = `/avatars/${fileName}`;
    user.avatarURL = avatarURL;
    await user.save();
    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};
