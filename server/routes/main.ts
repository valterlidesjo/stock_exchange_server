import express from "express";
import { Router, Request, Response } from 'express';
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const jwtSecret = process.env.JWT_SECRET || "default_secret";
const router = express.Router();

/* authenticator för att kolla så att användaren är inloggad*/
const authMiddleware = (req: any, res: any, next: Function) => {
  const token = req.cookies.token || req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded !== "string" && "userId" in decoded) {
      req.userId = decoded.userId;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/*getting sign up info and setting in mongo*/
router.post("/signUpForm", async (req: any , res: any) => {
  const { userName, userPswrd, email } = req.body;

  try {
    const existingUser = await User.findOne({ userName });

    if (!existingUser) {
  
      const hashedPassword = await bcrypt.hash(userPswrd, 6);

      const user = await User.create({ userName, userPswrd: hashedPassword, email });

      return res.status(201).json({ message: "User created", user });

    } else {
 
      return res.status(409).json({ message: "User already exists" });
    }
  } catch (error) {
    console.error("Error during sign up:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

/* finding user, loging in and redirecting*/
router.post("/loginForm", async (req: any, res: any) => {
  try {
    const { userName, userPswrd } = req.body;
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(userPswrd, user.userPswrd);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict", 
    });
    return res.status(200).json({ message: "User logged in", user });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/mainpage", authMiddleware, async (req: any, res: any) => {
  try {
    return res.status(200).json({ message: "Welcome to mainpage" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/* checks sign in status */
router.get("/check-auth", authMiddleware, (req, res) => {
  res.status(200).json({ loggedIn: true });
});

/* logout and clear token */
router.get("/logout", (req: any, res: any) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.status(200).json({ message: "Logged out successfully" });
});


router.post("/saveTicker", authMiddleware, async (req: any, res: any) => {
  const { ticker } = req.body; // Få aktiedata från request
  const userId = req.userId; // `authMiddleware` lägger till userId i request

  if (!ticker) {
    return res.status(400).json({ message: "Stock data is required" });
  }

  try {
    // Hämta användare från databasen
    const user = await User.findById(userId); // Eller motsvarande databasoperation
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Spara aktien om den inte redan finns i sparade aktier
    if (!user.savedStocks.includes(ticker)) {
      user.savedStocks.push(ticker);
      await user.save(); // Spara till databasen
    }

    res.status(200).json({
      message: "Stock saved successfully",
      savedStocks: user.savedStocks,
    });
  } catch (error) {
    console.error("Error saving stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/savedTickers", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ savedStocks: user.savedStocks });
  } catch (error) {
    console.error("Error fetching saved stocks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/userInfo", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ username: user.userName, email: user.email, created: user.createdAt });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

