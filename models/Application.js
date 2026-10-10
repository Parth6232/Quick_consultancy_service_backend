const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
    {
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        jobTitle: { type: String, required: true }, // snapshot: job delete ho jaye tab bhi title dikhega

        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        currentLocation: { type: String, default: '', trim: true },

        experience: { type: String, default: '', trim: true },
        currentCompany: { type: String, default: '', trim: true },
        currentCTC: { type: String, default: '', trim: true },
        expectedCTC: { type: String, default: '', trim: true },
        noticePeriod: { type: String, default: '', trim: true },

        linkedin: { type: String, default: '', trim: true },
        portfolio: { type: String, default: '', trim: true },
        coverLetter: { type: String, default: '', maxlength: 3000 },

        resume: { type: String, default: '' }, // Cloudinary URL

        status: {
            type: String,
            enum: ['New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'],
            default: 'New',
        },
    },
    { timestamps: true }
)

// Ek email se ek job par sirf ek hi baar apply
applicationSchema.index({ job: 1, email: 1 }, { unique: true })

module.exports = mongoose.model('Application', applicationSchema)