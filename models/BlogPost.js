const mongoose = require('mongoose')

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
        // Kis-kis ne like kiya (user id, admin ke liye "admin"). Ek user = ek like.
        // select:false => ye list public API response me kabhi nahi jaati (privacy)
        likedBy: { type: [String], default: [], select: false },
        comments: [commentSchema],
    },
    { timestamps: true }
)

module.exports = mongoose.model('BlogPost', blogPostSchema)