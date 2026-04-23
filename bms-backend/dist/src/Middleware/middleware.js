import jwt, {} from "jsonwebtoken";
export function Middleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        res.status(401).json({ message: "Auth Failed -- No Token Provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            res.status(401).json({ message: "Auth Failed -- Invalid Token" });
            return;
        }
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Auth Failed -- Token Expired or Invalid" });
        return;
    }
}
//# sourceMappingURL=middleware.js.map