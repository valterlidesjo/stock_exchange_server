import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { connectDB } from "./server/config/db.js";
import mainRouter from "./server/routes/main.js";
import router from "./server/routes/main.js";

const app = express();
const PORT = 3000;

//Connect to db
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "https://sillystocks.netlify.app/", credentials: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use("/", router);


app.listen(PORT, () => {
  console.log(`App listening on Port: ${PORT}`);
});
