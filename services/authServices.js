import { User } from "../models/User.js";

export async function findUserByEmail(email) {
  return User.findOne({ where: { email } });
}

export async function createUser(payload) {
  return User.create(payload);
}

export async function updateUserToken(user, token) {
  user.token = token;
  await user.save();
  return user;
}

export async function clearUserToken(user) {
  user.token = null;
  await user.save();
  return user;
}
