import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js"


export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(401).json({ error: "Admin check failed: User not found in database." });
    }

    if (user.role !== "ADMIN") {
      return res.status(401).json({ 
        error: `Admin check failed. Your database role is currently '${user.role}', but it needs to be 'ADMIN'.` 
      });
    }


    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).json({ error: "Server error during admin check." });
  }
};