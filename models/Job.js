const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        department: { type: String, default: 'General', trim: true },
        location: { type: String, default: 'Remote', trim: true },
        jobType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
            default: 'Full-time',
        },
        experience: { type: String, default: 'Fresher', trim: true }, // e.g. "2-4 years"
        salary: { type: String, default: '', trim: true },            // optional
        description: { type: String, required: true },
        skills: { type: [String], default: [] },
        isActive: { type: Boolean, default: true }, // false = applications band
    },
    { timestamps: true }
)

module.exports = mongoose.model('Job', jobSchema)