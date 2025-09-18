import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import HttpError from "../helpers/HttpError.js";

const JWT_SECRET = "your_jwt_secret";

const auth = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      throw HttpError(401, "Not authorized");
    }

    const { id } = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(id);

    if (!user || user.token !== token) {
      throw HttpError(401, "Not authorized");
    }

    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401, "Not authorized"));
  }
};

export default auth;
