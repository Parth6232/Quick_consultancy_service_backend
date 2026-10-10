import mongoose from 'mongoose'

const portfolioSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        images: { type: [String], default: [] }, // multiple images (pehli image = cover)
        videos: { type: [String], default: [] }, // videos
        image: { type: String, default: '' },    // cover image (purane code/data ke liye)
        link: { type: String, default: '' },
        category: { type: String, default: 'General' },
        client: { type: String, default: '' },
    },
    {
        timestamps: true,
        toJSON: {
            // Purani entries jinme sirf `image` tha, unke liye images array bhar do
            transform: (doc, ret) => {
                if ((!ret.images || ret.images.length === 0) && ret.image) {
                    ret.images = [ret.image]
                }
                return ret
            },
        },
    }
)

export default mongoose.model('Portfolio', portfolioSchema)