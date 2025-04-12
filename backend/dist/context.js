"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appContext = exports.createContext = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const createContext = () => {
    return {
        db: prisma_1.default,
    };
};
exports.createContext = createContext;
exports.appContext = (0, exports.createContext)();
