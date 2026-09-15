import express from 'express'
import { getAllPortfolio, createPortfolio } from '../controllers/portfolioController.js'

import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getAllPortfolio)
router.post('/', protect, adminOnly, createPortfolio)

export default router