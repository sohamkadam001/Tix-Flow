import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        export interface Request {
            userId?: string
        }
    }
}
export function Middleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        res.status(401).json({ message: "Auth Failed -- No Token Provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as JwtPayload;

        if (!decoded) {
            res.status(401).json({ message: "Auth Failed -- Invalid Token" });
            return;
        }
        req.userId = decoded.userId as string;
        next();
    } catch (error) {

        res.status(401).json({ message: "Auth Failed -- Token Expired or Invalid" });
        return;
    }
}