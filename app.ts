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

const corsOptions = {
  origin: 'https://sillystocks.netlify.app', // Ersätt med din Netlify-URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Tillåtna HTTP-metoder
  credentials: true, // Om cookies används
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use("/", router);


app.listen(PORT, () => {
  console.log(`App listening on Port: ${PORT}`);
});
