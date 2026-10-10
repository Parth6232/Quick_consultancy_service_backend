const multer = require('multer')

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB per file (video ke liye)
const MAX_RESUME_SIZE = 5 * 1024 * 1024 // 5 MB (resume ke liye)

const RESUME_TYPES = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true)
        } else {
            cb(new Error('Sirf image ya video files allowed hain'))
        }
    },
})

// Resume ke liye alag uploader (sirf PDF / DOC / DOCX)
const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_RESUME_SIZE },
    fileFilter: (req, file, cb) => {
        if (RESUME_TYPES.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Resume sirf PDF, DOC ya DOCX hona chahiye'))
        }
    },
})

// multer ke errors ko clean JSON message me convert karta hai
const handle = (multerMiddleware, maxSizeLabel = '50MB') => (req, res, next) => {
    multerMiddleware(req, res, (err) => {
        if (!err) return next()
        const message =
            err.code === 'LIMIT_FILE_SIZE' ? `File ${maxSizeLabel} se badi hai`
                : err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Allowed se zyada files bheji gayi hain'
                    : err.message
        res.status(400).json({ message })
    })
}

// Blog: ek cover image (form field name: "image")
const uploadBlogImage = handle(upload.single('image'))

// Portfolio: max 10 images (field "images") + max 2 videos (field "videos")
const uploadPortfolioMedia = handle(
    upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 2 },
    ])
)

// Career: job application ka ek resume (form field name: "resume")
const uploadResume = handle(resumeUpload.single('resume'), '5MB')

module.exports = { uploadBlogImage, uploadPortfolioMedia, uploadResume }