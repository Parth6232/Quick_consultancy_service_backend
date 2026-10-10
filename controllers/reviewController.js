const Review = require('../models/Review')

// GET /api/reviews?page=1&limit=6   (public)
// Response: { reviews, total, average, breakdown: {1..5}, page, pages }
const getReviews = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 50)

    const [reviews, stats] = await Promise.all([
      Review.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.aggregate([{ $group: { _id: '$rating', count: { $sum: 1 } } }]),
    ])

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let total = 0
    let sum = 0
    stats.forEach(({ _id, count }) => {
      breakdown[_id] = count
      total += count
      sum += _id * count
    })
    const average = total ? Math.round((sum / total) * 10) / 10 : 0

    res.json({ reviews, total, average, breakdown, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/reviews  (logged-in user)
const createReview = async (req, res) => {
  try {
    const { title, role, quote, rating } = req.body
    const stars = Number(rating)
    if (!quote || quote.trim().length < 10) {
      return res.status(400).json({ message: 'Please write at least 10 characters' })
    }
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Please select a rating between 1 and 5' })
    }
    const review = await Review.create({
      user: req.user.id,
      name: req.user.name,
      title: title || '',
      role: role || '',
      quote,
      rating: stars,
    })
    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/reviews/:id  (admin only)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id)
    if (!review) return res.status(404).json({ message: 'Review not found' })
    res.json({ message: 'Review deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getReviews, createReview, deleteReview }