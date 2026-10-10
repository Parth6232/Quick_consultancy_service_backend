const express = require('express')
const {
    getAllPortfolio,
    getPortfolioById,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
} = require('../controllers/portfolioController')

const { protect, adminOnly } = require('../middleware/auth')
const { uploadPortfolioMedia } = require('../middleware/upload')

const router = express.Router()

// Public
router.get('/', getAllPortfolio)
router.get('/:id', getPortfolioById)

// Admin only
router.post('/', protect, adminOnly, uploadPortfolioMedia, createPortfolio)
router.patch('/:id', protect, adminOnly, uploadPortfolioMedia, updatePortfolio)
router.delete('/:id', protect, adminOnly, deletePortfolio)

module.exports = router