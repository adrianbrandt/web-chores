"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMiddleware = void 0;
const context_1 = require("@/context");
const contextMiddleware = (req, res, next) => {
    req.context = context_1.appContext;
    next();
};
exports.contextMiddleware = contextMiddleware;
