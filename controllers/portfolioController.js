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

// "imageOrder" = final order of ALL images, as a JSON array of tokens:
//   - an existing image URL (jo is project ki already hai), ya
//   - "new:0", "new:1" ... = nayi upload hui files (req.files.images ka index)
// Galat JSON aaye to null return karta hai (taaki galti se saari images delete na ho)
const parseOrder = (value) => {
    if (value === undefined) return undefined
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : null
    } catch {
        return null
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
// imageOrder (optional) = images ka FINAL order (existing URLs + "new:<index>"), isse cover/order
//   bhi control hota hai aur kisi purani image ko crop karke usi jagah replace kiya ja sakta hai.
//   imageOrder na bheja jaye to purana tareeka: pehle existingImages, phir nayi files.
const updatePortfolio = async (req, res) => {
    try {
        const item = await Portfolio.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Project not found' })

        const imageOrder = parseOrder(req.body.imageOrder)
        if (imageOrder === null) {
            return res.status(400).json({ message: 'imageOrder must be a valid JSON array' })
        }

        const { title, description, link, category, client } = req.body
        if (title !== undefined) item.title = title
        if (description !== undefined) item.description = description
        if (link !== undefined) item.link = link
        if (category !== undefined) item.category = category
        if (client !== undefined) item.client = client

        // Purani legacy `image` wali entry ho to usko images array me le aao
        const currentImages = item.images.length ? item.images : (item.image ? [item.image] : [])

        const keepVideos = parseList(req.body.existingVideos) ?? item.videos
        // Sirf wahi URLs rakho jo pehle se is project ke the (security)
        const validVideos = keepVideos.filter((u) => item.videos.includes(u))
        const removedVideos = item.videos.filter((u) => !validVideos.includes(u))

        const [newImages, newVideos] = await Promise.all([
            uploadManyToCloudinary(req.files?.images, 'portfolio/images'),
            uploadManyToCloudinary(req.files?.videos, 'portfolio/videos'),
        ])

        let finalImages
        if (imageOrder) {
            // imageOrder hi final order hai
            const usedNew = new Set()
            finalImages = []
            for (const token of imageOrder) {
                if (typeof token !== 'string') continue
                if (token.startsWith('new:')) {
                    const i = Number(token.slice(4))
                    if (Number.isInteger(i) && newImages[i] && !usedNew.has(i)) {
                        finalImages.push(newImages[i])
                        usedNew.add(i)
                    }
                } else if (currentImages.includes(token) && !finalImages.includes(token)) {
                    finalImages.push(token)
                }
            }
            // order me jo nayi file mention nahi hui, use end me jod do (upload kabhi lost nahi hoga)
            newImages.forEach((u, i) => { if (!usedNew.has(i)) finalImages.push(u) })
        } else {
            const keepImages = parseList(req.body.existingImages) ?? currentImages
            const validImages = keepImages.filter((u) => currentImages.includes(u))
            finalImages = [...validImages, ...newImages]
        }

        // jo purani images final list me nahi hain, wo Cloudinary se hatayenge
        const removedImages = currentImages.filter((u) => !finalImages.includes(u))

        item.images = finalImages
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