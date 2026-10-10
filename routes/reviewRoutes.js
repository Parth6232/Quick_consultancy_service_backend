const express = require('express')
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

router.get('/', getReviews)
router.post('/', protect, createReview)
router.delete('/:id', protect, adminOnly, deleteReview)

module.exports = router