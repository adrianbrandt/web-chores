"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const limiter_1 = require("@/middleware/limiter");
describe('authLimiter middleware', () => {
    let app;
    beforeEach(() => {
        app = (0, express_1.default)();
        app.use('/test', limiter_1.authLimiter, (req, res) => {
            res.status(200).json({ message: 'Success' });
        });
    });
    it('should allow up to 5 requests', () => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < 5; i++) {
            const res = yield (0, supertest_1.default)(app).get('/test');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Success' });
        }
    }));
    it('should block the 6th request with 429', () => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < 5; i++) {
            yield (0, supertest_1.default)(app).get('/test');
        }
        const res = yield (0, supertest_1.default)(app).get('/test');
        expect(res.status).toBe(429);
        expect(res.body).toEqual({ message: 'Too many requests. Try again later.' });
    }));
});
