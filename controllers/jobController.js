const Job = require('../models/Job')

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
const createJob = async (req, res) => {
    try {
        const { title, department, location, jobType, experience, salary, description, skills } = req.body
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' })
        }
        const job = await Job.create({
            title, department, location, jobType, experience, salary, description,
            skills: parseSkills(skills),
        })
        res.status(201).json(job)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH /api/jobs/:id  (admin) — edit ya isActive true/false karke open/close
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

        await job.save()
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
        await job.deleteOne()
        res.json({ message: 'Job deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = { getActiveJobs, getAllJobsAdmin, getJobById, createJob, updateJob, deleteJob }