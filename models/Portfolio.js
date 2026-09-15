import mongoose from 'mongoose'

const portfolioSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        image: { type: String, default: '' },
        link: { type: String, default: '' },
        category: { type: String, default: 'General' },
        client: { type: String, default: '' },
    },
    { timestamps: true }
)

export default mongoose.model('Portfolio', portfolioSchema)