import { JwtPayload } from '@/types';
import { AppContext } from '@/context';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      context: AppContext;
    }
  }
}
