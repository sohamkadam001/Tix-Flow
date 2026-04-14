import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken"
import { Middleware } from "../Middleware/middleware.js";

const AuthRouter = express.Router()

const validator = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name is required"),
});

const verifySchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const signinSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password is required")
});

const resendSchema = z.object({
  email: z.email("Invalid email format"),
});

AuthRouter.post("/signup", async (req, res) => {
  const parser = validator.safeParse(req.body)
  if (!parser.success) {
    return res.status(400).json({ error: parser.error.message });
  }
  const { email, password, name } = parser.data
  try {
    const existUser = await prisma.user.findUnique({
      where: {
        email
      }
    })
    if (existUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashpassword = await bcrypt.hash(password, 10)
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);


    await prisma.user.create({
      data: {
        name,
        email,
        password: hashpassword,
        otp,
        otpExpiresAt: otpExpiry,
        isVerified: false
      }
    })
    //resend integrate karna hai
    console.log(`\n--- TIXFLOW OTP for ${email} ---`);
    console.log(`CODE: ${otp}`);
    console.log(`---------------------------------\n`);

    res.status(201).json({
      message: "Please verify your OTP to complete registration.",
      devOtp: otp
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

AuthRouter.post("/verify-otp", async (req, res) => {
  const parser = verifySchema.safeParse(req.body);
  if (!parser.success) {
    return res.status(400).json({ error: parser.error.message });
  }

  const { email, otp } = parser.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    res.status(200).json({ message: "Account verified successfully! You can now sign in." });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

AuthRouter.post("/signin", async (req, res) => {
  const parser = signinSchema.safeParse(req.body);

  if (!parser.success) {
    return res.status(400).json({ error: parser.error.message });
  }

  const { email, password } = parser.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }


    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your account.",
        isVerified: false
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

   const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!
);

    res.status(200).json({
      message: "Signin successful",
      token: token,
    });

  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

AuthRouter.post("/resend-otp", async (req, res) => {
  const parser = resendSchema.safeParse(req.body);

  if (!parser.success) {
    return res.status(400).json({ error: parser.error.message });
  }

  const { email } = parser.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Account is already verified. Please sign in." });
    }

   const newOtp = Math.floor(Math.random()*900000 + 100000).toString()
   const newExpiry = new Date(Date.now() + 5 * 60 * 1000)


    await prisma.user.update({
      where: { email },
      data: {
        otp: newOtp,
        otpExpiresAt: newExpiry,
      },
    });

    console.log(`\n--- FRESH OTP GENERATED FOR ${email} ---`);
    console.log(`NEW CODE: ${newOtp}`);
    console.log(`----------------------------------------\n`);

    res.status(200).json({ message: "A new OTP has been sent to your email.", devOtp: newOtp});

  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

AuthRouter.post("/make-admin", async (req, res) => {
  try {
    const { email, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Nice try. Invalid secret key." });
    }

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });

    res.status(200).json({ 
      message: `${email} has been officially upgraded to ADMIN status!` 
    });

  } catch (error) {
    console.error("Admin Upgrade Error:", error);
    res.status(500).json({ error: "User not found or database error." });
  }
});

AuthRouter.get("/me", Middleware,async (req, res) => {
  try {
    // The authMiddleware attached the userId to req
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // Optional: if you have roles like ADMIN/USER
        isVerified: true
        // NEVER return the password field
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Send the user data back to the frontend
    res.status(200).json({ user });

  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default AuthRouter;