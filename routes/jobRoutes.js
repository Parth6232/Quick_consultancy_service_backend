const express = require('express')
const {
    getActiveJobs, getAllJobsAdmin, getJobById, createJob, updateJob, deleteJob,
} = require('../controllers/jobController')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

// Admin (ye '/:id' se PEHLE rakhna zaroori hai, warna "admin" ko id samjhega)
router.get('/admin/all', protect, adminOnly, getAllJobsAdmin)

// Public
router.get('/', getActiveJobs)
router.get('/:id', getJobById)

// Admin only
router.post('/', protect, adminOnly, createJob)
router.patch('/:id', protect, adminOnly, updateJob)
router.delete('/:id', protect, adminOnly, deleteJob)

module.exports = router