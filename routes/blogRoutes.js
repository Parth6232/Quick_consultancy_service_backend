const express = require('express')
const {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
} = require('../controllers/blogController')

const { protect, optionalAuth, adminOnly } = require('../middleware/auth')
const { uploadBlogImage } = require('../middleware/upload')

const router = express.Router()

// Public (login ho to "likedByUser" bhi milta hai)
router.get('/', optionalAuth, getAllBlogs)
router.get('/:id', optionalAuth, getBlogById)

// Admin only
router.post('/', protect, adminOnly, uploadBlogImage, createBlog)
router.patch('/:id', protect, adminOnly, uploadBlogImage, updateBlog)
router.delete('/:id', protect, adminOnly, deleteBlog)

// Logged-in users (admin bhi)
router.post('/:id/like', protect, likeBlog) // toggle: like / unlike
router.post('/:id/comment', protect, addComment)

module.exports = router