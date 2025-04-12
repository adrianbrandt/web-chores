"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("@/routes"));
const httpLogger_1 = __importDefault(require("./middleware/httpLogger/httpLogger"));
const logger_1 = __importDefault(require("./config/logger"));
const errorMiddleware_1 = require("@/middleware/errorMiddleware/errorMiddleware");
const context_1 = require("@/middleware/context/context");
const limiter_1 = require("@/middleware/limiter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(httpLogger_1.default);
app.use(context_1.contextMiddleware);
app.use(limiter_1.authLimiter);
app.use('/api', routes_1.default);
app.use(errorMiddleware_1.errorMiddleware);
app.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', { error: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection:', {
        reason: reason instanceof Error ? reason.stack : reason,
        promise,
    });
});
