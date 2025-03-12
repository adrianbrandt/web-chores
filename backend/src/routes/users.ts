// backend/src/routes/users.ts
import express from 'express';
import {
  createUser,
  getUserById,
  loginUser,
  getAllUsers, logoutUser, getCurrentUser,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', createUser);

// Login
router.post('/login', loginUser);

router.post('/logout', logoutUser);

router.get('/me', authenticateToken, getCurrentUser);


// Get user by ID
router.get('/:id', getUserById);

// Get all users (for admin purposes)
router.get('/', getAllUsers);

export default router;