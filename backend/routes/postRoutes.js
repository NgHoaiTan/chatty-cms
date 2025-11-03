import express from 'express';
import { getPosts, getPostById } from '../controllers/postController.js';

const router = express.Router();

// Get all posts
router.get('/', getPosts);

// Get post by ID
router.get('/:id', getPostById);

export default router;

