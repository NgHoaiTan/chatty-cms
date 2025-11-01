import express from 'express';
import { getUsers, getUserById, getUsersStats, getNewUsersThisMonth, getUsersByMonth, deleteUser, restoreUser } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getUsers);

// Get user statistics
router.get('/stats', getUsersStats);

// Get users created in the current month
router.get('/new-this-month', getNewUsersThisMonth);

// Get users count by month for current year
router.get('/by-month', getUsersByMonth);

// Delete user by ID (phải đặt trước /:id để tránh conflict)
router.delete('/:id', deleteUser);

// Restore user by ID
router.post('/:id/restore', restoreUser);

// Get user by ID
router.get('/:id', getUserById);

export default router;

