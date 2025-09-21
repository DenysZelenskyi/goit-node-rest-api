import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import HttpError from "../helpers/HttpError.js";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    let id;
    try {
      ({ id } = jwt.verify(token, JWT_SECRET));
    } catch (err) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findByPk(id);
    if (!user || user.token !== token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export default auth;
