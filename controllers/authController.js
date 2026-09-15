import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(400).json({ message: 'An account with this email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed })

    const token = signToken({ id: user._id, name: user.name, role: 'user' })
    res.status(201).json({ token, user: { name: user.name, email: user.email, role: 'user' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken({ id: user._id, name: user.name, role: 'user' })
    res.json({ token, user: { name: user.name, email: user.email, role: 'user' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/admin/login
export const loginAdmin = (req, res) => {
  const { email, password } = req.body
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials' })
  }
  const token = signToken({ role: 'admin', name: 'Admin' })
  res.json({ token, user: { name: 'Admin', role: 'admin' } })
}

// GET /api/auth/me
export const getMe = (req, res) => {
  res.json(req.user)
}
