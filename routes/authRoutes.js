import express from 'express'
import { registerUser, loginUser, loginAdmin, getMe } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/admin/login', loginAdmin)
router.get('/me', protect, getMe)

export default router
