const mongoose = require('mongoose')
const BlogPost = require('../models/BlogPost')
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload')

// Like ke liye user ki pehchaan: normal user = uska id, admin = "admin"
// (admin ke token me id nahi hota, aur admin sirf ek hi hai)
const getUserKey = (user) => {
    if (!user) return null
    if (user.id) return String(user.id)
    if (user.role === 'admin') return 'admin'
    return null
}

// Response me likedBy (users ki list) kabhi nahi bhejte, sirf "likedByUser: true/false"
const withLikeState = (blog, likedByUser) => {
    const obj = typeof blog.toObject === 'function' ? blog.toObject() : { ...blog }
    delete obj.likedBy
    obj.likedByUser = likedByUser
    return obj
}

// GET /api/blogs
const getAllBlogs = async (req, res) => {
    try {
        const key = getUserKey(req.user)
        const blogs = await BlogPost.find().select('+likedBy').sort({ createdAt: -1 }).lean()
        res.json(blogs.map((b) => withLikeState(b, key ? (b.likedBy || []).includes(key) : false)))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/blogs/:id
const getBlogById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ message: 'Blog not found' })
        }
        const key = getUserKey(req.user)
        const blog = await BlogPost.findById(req.params.id).select('+likedBy')
        if (!blog) return res.status(404).json({ message: 'Blog not found' })
        res.json(withLikeState(blog, key ? (blog.likedBy || []).includes(key) : false))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/blogs  (admin) — multipart/form-data, image field: "image"
const createBlog = async (req, res) => {
    try {
        const { title, content, author } = req.body
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' })
        }

        let image = req.body.image || '' // optional: purana URL wala tareeka bhi chalega
        if (req.file) image = await uploadToCloudinary(req.file, 'blog')

        const blog = await BlogPost.create({ title, content, image, author })
        res.status(201).json(blog)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH /api/blogs/:id  (admin)
// Nayi image bheji to purani delete hoke nayi lagegi. removeImage="true" bheja to image hat jayegi.
const updateBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findById(req.params.id)
        if (!blog) return res.status(404).json({ message: 'Blog not found' })

        const { title, content, author, removeImage } = req.body
        if (title !== undefined) blog.title = title
        if (content !== undefined) blog.content = content
        if (author !== undefined) blog.author = author

        if (req.file) {
            const newUrl = await uploadToCloudinary(req.file, 'blog')
            await deleteFromCloudinary(blog.image)
            blog.image = newUrl
        } else if (removeImage === 'true') {
            await deleteFromCloudinary(blog.image)
            blog.image = ''
        }

        await blog.save()
        res.json(blog)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE /api/blogs/:id  (admin)
const deleteBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findById(req.params.id)
        if (!blog) return res.status(404).json({ message: 'Blog not found' })

        await deleteFromCloudinary(blog.image)
        await blog.deleteOne()
        res.json({ message: 'Blog deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/blogs/:id/like  (login zaroori) — TOGGLE
// Ek user ek blog ko sirf ek baar like kar sakta hai. Dobara click => unlike.
// Dono updates atomic hain, isliye tez/double click par bhi count galat nahi hota.
const likeBlog = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Blog not found' })

        const key = getUserKey(req.user)
        if (!key) return res.status(401).json({ message: 'Please log in to like this post' })

        // 1) Pehle like karne ki koshish — sirf tab jab is user ne abhi tak like nahi kiya
        let liked = true
        let blog = await BlogPost.findOneAndUpdate(
            { _id: id, likedBy: { $ne: key } },
            { $addToSet: { likedBy: key }, $inc: { likes: 1 } },
            { new: true }
        )

        // 2) Pehle se like kiya hua hai => unlike
        if (!blog) {
            liked = false
            blog = await BlogPost.findOneAndUpdate(
                { _id: id, likedBy: key },
                { $pull: { likedBy: key }, $inc: { likes: -1 } },
                { new: true }
            )
        }

        if (!blog) return res.status(404).json({ message: 'Blog not found' })

        // Safety: purane data ki wajah se likes kabhi 0 se neeche na jaye
        if (blog.likes < 0) {
            await BlogPost.updateOne({ _id: id, likes: { $lt: 0 } }, { $set: { likes: 0 } })
            blog.likes = 0
        }

        res.json(withLikeState(blog, liked))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/blogs/:id/comment
const addComment = async (req, res) => {
    try {
        const { text } = req.body
        const name = req.user.name // Comes from the 'protect' middleware

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' })
        }
        const blog = await BlogPost.findById(req.params.id)
        if (!blog) return res.status(404).json({ message: 'Blog not found' })

        blog.comments.push({ name, text })
        await blog.save()
        res.status(201).json(blog)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
}