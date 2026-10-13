const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, please log in' })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired session, please log in again' })
  }
}

// Login ho to user pehchan lo, na ho (ya token galat/expired ho) to bhi request ko rok'o mat.
// Public pages (jaise blog) me "is user ne like kiya hai ya nahi" batane ke liye use hota hai.
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    } catch (err) {
      // galat token => anonymous visitor ki tarah aage badho
    }
  }
  next()
}

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

module.exports = { protect, optionalAuth, adminOnly }