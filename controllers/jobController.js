const Job = require('../models/Job')
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload')

// "skills" array ya comma-separated string, dono accept karta hai
const parseSkills = (value) => {
    if (value === undefined) return undefined
    if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean)
    return String(value).split(',').map((s) => s.trim()).filter(Boolean)
}

// GET /api/jobs  (public) — sirf open jobs
const getActiveJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 })
        res.json(jobs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/jobs/admin/all  (admin) — open + closed dono
const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 })
        res.json(jobs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/jobs/:id  (public)
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) return res.status(404).json({ message: 'Job not found' })
        res.json(job)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// POST /api/jobs  (admin)
// multipart/form-data (cover image ke saath) ya normal JSON — dono chalte hain
// cover image ka field name: "coverImage"
const createJob = async (req, res) => {
    try {
        const { title, department, location, jobType, experience, salary, description, skills } = req.body
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' })
        }

        let coverImage = ''
        if (req.file) coverImage = await uploadToCloudinary(req.file, 'jobs')

        try {
            const job = await Job.create({
                title, department, location, jobType, experience, salary, description,
                skills: parseSkills(skills),
                coverImage,
            })
            res.status(201).json(job)
        } catch (err) {
            await deleteFromCloudinary(coverImage) // job save na hui to uploaded image hata do
            throw err
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH /api/jobs/:id  (admin) — edit ya isActive true/false karke open/close
// Nayi coverImage file aaye to purani replace hogi.
// removeCoverImage="true" bheja to cover image hat jayegi.
const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) return res.status(404).json({ message: 'Job not found' })

        const fields = ['title', 'department', 'location', 'jobType', 'experience', 'salary', 'description', 'isActive']
        fields.forEach((f) => {
            if (req.body[f] !== undefined) job[f] = req.body[f]
        })
        const skills = parseSkills(req.body.skills)
        if (skills !== undefined) job.skills = skills

        const oldImage = job.coverImage
        let newImage = null

        if (req.file) {
            newImage = await uploadToCloudinary(req.file, 'jobs')
            job.coverImage = newImage
        } else if (req.body.removeCoverImage === 'true' || req.body.removeCoverImage === true) {
            job.coverImage = ''
        }

        try {
            await job.save()
        } catch (err) {
            if (newImage) await deleteFromCloudinary(newImage) // save fail hua to nayi upload hata do
            throw err
        }

        // save ho gaya, ab purani image Cloudinary se hata sakte hain
        if (oldImage && oldImage !== job.coverImage) await deleteFromCloudinary(oldImage)

        res.json(job)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE /api/jobs/:id  (admin)
// Note: applications delete NAHI hongi (unme jobTitle saved hai), admin ka data safe rahega
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) return res.status(404).json({ message: 'Job not found' })

        const image = job.coverImage
        await job.deleteOne()
        await deleteFromCloudinary(image) // job ki cover image Cloudinary se bhi hatao

        res.json({ message: 'Job deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getActiveJobs, getAllJobsAdmin, getJobById, createJob, updateJob, deleteJob }