import express from 'express';
import { getUsers, getUserById, getUsersStats, getNewUsersThisMonth } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);

// Get user statistics
router.get('/stats', getUsersStats);

// Get count of new users in current month
router.get('/stats/new-this-month', getNewUsersThisMonth);

// Get user by ID
router.get('/:id', getUserById);

export default router;

