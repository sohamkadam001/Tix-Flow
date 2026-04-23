import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
export declare function Middleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=middleware.d.ts.map