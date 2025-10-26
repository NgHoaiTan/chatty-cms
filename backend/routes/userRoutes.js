import express from 'express';
import { getUsers, getUserById, getUsersStats } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);

// Get user statistics
router.get('/stats', getUsersStats);

// Get user by ID
router.get('/:id', getUserById);

export default router;

