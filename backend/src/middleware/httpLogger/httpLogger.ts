import morgan from 'morgan';
import { logStream } from '@/config/logger';

const httpLogger = morgan('combined', { stream: logStream });

export default httpLogger;
