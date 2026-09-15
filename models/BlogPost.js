import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        text: { type: String, required: true, trim: true },
    },
    { timestamps: true }
)

const blogPostSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        image: { type: String, default: '' },
        author: { type: String, default: 'Quick Consulting Team' },
        likes: { type: Number, default: 0 },
        comments: [commentSchema],
    },
    { timestamps: true }
)

export default mongoose.model('BlogPost', blogPostSchema)