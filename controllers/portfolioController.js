const Portfolio = require('../models/Portfolio')
const {
    uploadManyToCloudinary,
    deleteManyFromCloudinary,
} = require('../utils/cloudinaryUpload')

// "existingImages" jaisi field JSON string me aati hai, usko safe tareeke se array banata hai
const parseList = (value) => {
    if (value === undefined) return undefined
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

// GET /api/portfolio
const getAllPortfolio = async (req, res) => {
    try {
        const items = await Portfolio.find().sort({ createdAt: -1 })
        res.json(items)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/portfolio/:id
const getPortfolioById = async (req, res) => {
    try {
        const item = await Portfolio.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Project not found' })
        res.json(item)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/portfolio  (admin) — multipart/form-data
// files: "images" (max 10), "videos" (max 2)
const createPortfolio = async (req, res) => {
    try {
        const { title, description, link, category, client } = req.body
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' })
        }

        const [images, videos] = await Promise.all([
            uploadManyToCloudinary(req.files?.images, 'portfolio/images'),
            uploadManyToCloudinary(req.files?.videos, 'portfolio/videos'),
        ])

        const item = await Portfolio.create({
            title, description, link, category, client,
            images,
            videos,
            image: images[0] || '',
        })
        res.status(201).json(item)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH /api/portfolio/:id  (admin)
// existingImages / existingVideos = JSON array jo rakhni hain (baaki Cloudinary se delete ho jayengi)
// images / videos files = nayi files jo add karni hain
const updatePortfolio = async (req, res) => {
    try {
        const item = await Portfolio.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Project not found' })

        const { title, description, link, category, client } = req.body
        if (title !== undefined) item.title = title
        if (description !== undefined) item.description = description
        if (link !== undefined) item.link = link
        if (category !== undefined) item.category = category
        if (client !== undefined) item.client = client

        // Purani legacy `image` wali entry ho to usko images array me le aao
        const currentImages = item.images.length ? item.images : (item.image ? [item.image] : [])

        const keepImages = parseList(req.body.existingImages) ?? currentImages
        const keepVideos = parseList(req.body.existingVideos) ?? item.videos

        // Sirf wahi URLs rakho jo pehle se is project ke the (security)
        const validImages = keepImages.filter((u) => currentImages.includes(u))
        const validVideos = keepVideos.filter((u) => item.videos.includes(u))

        const removedImages = currentImages.filter((u) => !validImages.includes(u))
        const removedVideos = item.videos.filter((u) => !validVideos.includes(u))

        const [newImages, newVideos] = await Promise.all([
            uploadManyToCloudinary(req.files?.images, 'portfolio/images'),
            uploadManyToCloudinary(req.files?.videos, 'portfolio/videos'),
        ])

        item.images = [...validImages, ...newImages]
        item.videos = [...validVideos, ...newVideos]
        item.image = item.images[0] || ''

        await item.save()
        await deleteManyFromCloudinary([...removedImages, ...removedVideos])

        res.json(item)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE /api/portfolio/:id  (admin)
const deletePortfolio = async (req, res) => {
    try {
        const item = await Portfolio.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Project not found' })

        const allImages = new Set([...item.images, ...(item.image ? [item.image] : [])])
        await deleteManyFromCloudinary([...allImages, ...item.videos])
        await item.deleteOne()

        res.json({ message: 'Project deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getAllPortfolio,
    getPortfolioById,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
}