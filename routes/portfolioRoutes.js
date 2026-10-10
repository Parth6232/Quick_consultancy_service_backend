import express from 'express'
import {
    getAllPortfolio,
    getPortfolioById,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
} from '../controllers/portfolioController.js'

import { protect, adminOnly } from '../middleware/auth.js'
import { uploadPortfolioMedia } from '../middleware/upload.js'

const router = express.Router()

// Public
router.get('/', getAllPortfolio)
router.get('/:id', getPortfolioById)

// Admin only
router.post('/', protect, adminOnly, uploadPortfolioMedia, createPortfolio)
router.patch('/:id', protect, adminOnly, uploadPortfolioMedia, updatePortfolio)
router.delete('/:id', protect, adminOnly, deletePortfolio)

export default router