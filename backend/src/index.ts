import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from '@/routes';
import httpLogger from './middleware/httpLogger/httpLogger';
import logger from './config/logger';
import { errorMiddleware } from '@/middleware/errorMiddleware/errorMiddleware';
import { contextMiddleware } from '@/middleware/context/context';
import { authLimiter } from '@/middleware/limiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(httpLogger);
app.use(contextMiddleware);
app.use(authLimiter);

app.use('/api', routes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.stack : reason,
    promise,
  });
});
