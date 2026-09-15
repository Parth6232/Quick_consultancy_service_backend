import express from 'express'
import {
    getAllBlogs,
    getBlogById,
    createBlog,
    likeBlog,
    addComment,
} from '../controllers/blogController.js'

import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getAllBlogs)
router.get('/:id', getBlogById)
router.post('/', protect, adminOnly, createBlog)
router.post('/:id/like', likeBlog)
router.post('/:id/comment', protect, addComment)

export default router