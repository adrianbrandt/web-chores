"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        res.status(401).json({ message: 'No token, authorization denied' });
        return;
    }
    try {
        req.user = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.authMiddleware = authMiddleware;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authorization denied' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Permission denied' });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
