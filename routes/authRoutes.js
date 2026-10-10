const express = require('express')
const { registerUser, loginUser, loginAdmin, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/admin/login', loginAdmin)
router.get('/me', protect, getMe)

module.exports = router
