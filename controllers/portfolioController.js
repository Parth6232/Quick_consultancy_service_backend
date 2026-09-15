import Portfolio from '../models/Portfolio.js'

// GET /api/portfolio
export const getAllPortfolio = async (req, res) => {
    try {
        const items = await Portfolio.find().sort({ createdAt: -1 })
        res.json(items)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/portfolio
export const createPortfolio = async (req, res) => {
    try {
        const { title, description, image, link, category, client } = req.body
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' })
        }
        const item = await Portfolio.create({ title, description, image, link, category, client })
        res.status(201).json(item)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}