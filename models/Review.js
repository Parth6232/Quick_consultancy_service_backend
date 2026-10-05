import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, maxlength: 80, default: '' },
    title: { type: String, trim: true, maxlength: 80, default: '' },
    quote: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
)

export default mongoose.model('Review', reviewSchema)