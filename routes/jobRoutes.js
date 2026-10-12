const express = require('express')
const {
    getActiveJobs, getAllJobsAdmin, getJobById, createJob, updateJob, deleteJob,
} = require('../controllers/jobController')
const { protect, adminOnly } = require('../middleware/auth')
const { uploadJobImage } = require('../middleware/upload')

const router = express.Router()

// Admin (ye '/:id' se PEHLE rakhna zaroori hai, warna "admin" ko id samjhega)
router.get('/admin/all', protect, adminOnly, getAllJobsAdmin)

// Public
router.get('/', getActiveJobs)
router.get('/:id', getJobById)

// Admin only (cover image: form field "coverImage")
router.post('/', protect, adminOnly, uploadJobImage, createJob)
router.patch('/:id', protect, adminOnly, uploadJobImage, updateJob)
router.delete('/:id', protect, adminOnly, deleteJob)

module.exports = router