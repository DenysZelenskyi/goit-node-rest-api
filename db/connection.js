import dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialectOptions: {
    ssl: true,
  },
});

export async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successfully!");
  } catch (error) {
    console.log(`Database connection error ${error.message}`);
    process.exit(1);
  }
}
