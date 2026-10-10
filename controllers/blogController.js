import BlogPost from '../models/BlogPost.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js'

// GET /api/blogs
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await BlogPost.find().sort({ createdAt: -1 })
        res.json(blogs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/blogs/:id
export const getBlogById = async (req, res) => {
    try {
        const blog = await BlogPost.findById(req.params.id)
        if (!blog) return res.status(404).json({ message: 'Blog not found' })
        res.json(blog)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/blogs  (admin) — multipart/form-data, image field: "image"
export const createBlog = async (req, res) => {
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
export const updateBlog = async (req, res) => {
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
export const deleteBlog = async (req, res) => {
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

// POST /api/blogs/:id/like
export const likeBlog = async (req, res) => {
    try {
        const blog = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        )
        if (!blog) return res.status(404).json({ message: 'Blog not found' })
        res.json(blog)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/blogs/:id/comment
export const addComment = async (req, res) => {
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