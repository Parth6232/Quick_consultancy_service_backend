const express = require('express')
const {
    applyToJob, getApplications, getApplicationById, updateApplicationStatus, deleteApplication,
} = require('../controllers/applicationController')
const { protect, adminOnly } = require('../middleware/auth')
const { uploadResume } = require('../middleware/upload')

const router = express.Router()

// Public: koi bhi apply kar sakta hai (login zaroori nahi)
router.post('/apply/:jobId', uploadResume, applyToJob)

// Admin only
router.get('/', protect, adminOnly, getApplications)
router.get('/:id', protect, adminOnly, getApplicationById)
router.patch('/:id/status', protect, adminOnly, updateApplicationStatus)
router.delete('/:id', protect, adminOnly, deleteApplication)

module.exports = router