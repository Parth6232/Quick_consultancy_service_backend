const Application = require('../models/Application')
const Job = require('../models/Job')
const { uploadRawToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload')

const STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/applications/apply/:jobId  (public) — multipart/form-data, file field: "resume"
const applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId)
        if (!job) return res.status(404).json({ message: 'Job not found' })
        if (!job.isActive) return res.status(400).json({ message: 'Is job ke liye applications band hain' })

        const {
            name, email, phone, currentLocation, experience, currentCompany,
            currentCTC, expectedCTC, noticePeriod, linkedin, portfolio, coverLetter,
        } = req.body

        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email and phone are required' })
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ message: 'Valid email daalein' })
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Resume upload karna zaroori hai' })
        }

        const alreadyApplied = await Application.findOne({ job: job._id, email: email.toLowerCase() })
        if (alreadyApplied) {
            return res.status(400).json({ message: 'Aap is job ke liye pehle hi apply kar chuke hain' })
        }

        const resume = await uploadRawToCloudinary(req.file, 'resumes')

        const application = await Application.create({
            job: job._id,
            jobTitle: job.title,
            name, email, phone, currentLocation, experience, currentCompany,
            currentCTC, expectedCTC, noticePeriod, linkedin, portfolio, coverLetter,
            resume,
        })

        res.status(201).json({ message: 'Application submit ho gayi', id: application._id })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Aap is job ke liye pehle hi apply kar chuke hain' })
        }
        res.status(500).json({ message: err.message })
    }
}

// GET /api/applications  (admin) — table ke liye sirf important fields
// optional filters: ?job=<jobId>&status=New
const getApplications = async (req, res) => {
    try {
        const filter = {}
        if (req.query.job) filter.job = req.query.job
        if (req.query.status) filter.status = req.query.status

        const list = await Application.find(filter)
            .select('name email phone jobTitle job experience status createdAt')
            .sort({ createdAt: -1 })
        res.json(list)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// GET /api/applications/:id  (admin) — "View details" ke liye poora data
const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
        if (!application) return res.status(404).json({ message: 'Application not found' })
        res.json(application)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// PATCH /api/applications/:id/status  (admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body
        if (!STATUSES.includes(status)) {
            return res.status(400).json({ message: `Status in me se ek ho: ${STATUSES.join(', ')}` })
        }
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
        if (!application) return res.status(404).json({ message: 'Application not found' })
        res.json(application)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE /api/applications/:id  (admin) — resume bhi Cloudinary se hat jayega
const deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
        if (!application) return res.status(404).json({ message: 'Application not found' })
        await deleteFromCloudinary(application.resume)
        await application.deleteOne()
        res.json({ message: 'Application deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    applyToJob,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication,
}