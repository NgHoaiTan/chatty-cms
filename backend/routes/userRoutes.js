import express from 'express';
import { getUsers, getUserById, getUsersStats, getNewUsersThisMonth, getUsersByMonth } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);

// Get user statistics
router.get('/stats', getUsersStats);

// Get users created in the current month
router.get('/new-this-month', getNewUsersThisMonth);

// Get users count by month for current year
router.get('/by-month', getUsersByMonth);

// Get user by ID
router.get('/:id', getUserById);

export default router;

