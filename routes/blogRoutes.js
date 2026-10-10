import express from 'express'
import {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
} from '../controllers/blogController.js'

import { protect, adminOnly } from '../middleware/auth.js'
import { uploadBlogImage } from '../middleware/upload.js'

const router = express.Router()

// Public
router.get('/', getAllBlogs)
router.get('/:id', getBlogById)

// Admin only
router.post('/', protect, adminOnly, uploadBlogImage, createBlog)
router.patch('/:id', protect, adminOnly, uploadBlogImage, updateBlog)
router.delete('/:id', protect, adminOnly, deleteBlog)

// Logged-in users
router.post('/:id/like', likeBlog)
router.post('/:id/comment', protect, addComment)

export default router