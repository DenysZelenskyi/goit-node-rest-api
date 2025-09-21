import {
  findUserByVerificationToken,
  verifyUser,
} from "../services/authServices.js";
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
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
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
    const verificationToken = uuidv4();

    const newUser = await createUser({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verifyUrl = `http://localhost:${
      process.env.PORT || 3000
    }/api/auth/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Email verification",
      html: `<p>To verify your email, click <a href="${verifyUrl}">here</a> or open the link:<br>${verifyUrl}</p>`,
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
    if (!user.verify) {
      throw HttpError(401, "Email not verified");
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

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await findUserByVerificationToken(verificationToken);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await verifyUser(user);
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }
    if (!user.verificationToken) {
      const { v4: uuidv4 } = await import("uuid");
      user.verificationToken = uuidv4();
      await user.save();
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const verifyUrl = `http://localhost:${
      process.env.PORT || 3000
    }/api/auth/verify/${user.verificationToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Email verification",
      html: `<p>To verify your email, click <a href="${verifyUrl}">here</a> or open the link:<br>${verifyUrl}</p>`,
    });
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};
