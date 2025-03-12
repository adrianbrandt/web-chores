// backend/src/routes/users.ts
import express from 'express';
import {
  createUser,
  getUserById,
  loginUser,
  getAllUsers
} from '../controllers/userController';

const router = express.Router();

// Register a new user
router.post('/register', createUser);

// Login
router.post('/login', loginUser);

// Get user by ID
router.get('/:id', getUserById);

// Get all users (for admin purposes)
router.get('/', getAllUsers);

export default router;