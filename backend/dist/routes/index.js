"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("@/routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("@/routes/adminRoutes"));
const groupRoutes_1 = __importDefault(require("@/routes/groupRoutes"));
const router = express_1.default.Router();
router.use('/users', userRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
router.use('/groups', groupRoutes_1.default);
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Chores API!' });
});
exports.default = router;
