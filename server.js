import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import tweetRoutes from "./routes/tweetRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import colors from "colors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// port
const PORT = process.env.PORT || 5080;

// config env
dotenv.config();

// // connect database
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `Conneted To MongoDB Databse ${connect.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.log(`Error while connecting MongoDB ${error}`.bgRed.white);
  }
};

// // config database
connectDB();

// rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tweet", tweetRoutes);
app.use("/api/user", userRoutes);

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));
app.use("/profiles", express.static("profiles"));

// listen run
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan.white);
});
