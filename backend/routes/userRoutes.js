import express from 'express';
import { getUsers, getUserById, getUsersStats, getNewUsersThisMonth } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);

// Get user statistics
router.get('/stats', getUsersStats);

// Get users created in the current month
router.get('/new-this-month', getNewUsersThisMonth);

// Get user by ID
router.get('/:id', getUserById);

export default router;

