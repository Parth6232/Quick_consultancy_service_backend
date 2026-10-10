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

const { protect, adminOnly } = require('../middleware/auth')
const { uploadBlogImage } = require('../middleware/upload')

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

module.exports = router