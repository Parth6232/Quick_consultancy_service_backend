const multer = require('multer')

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB per file (video ke liye)

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

// multer ke errors ko clean JSON message me convert karta hai
const handle = (multerMiddleware) => (req, res, next) => {
    multerMiddleware(req, res, (err) => {
        if (!err) return next()
        const message =
            err.code === 'LIMIT_FILE_SIZE' ? 'File 50MB se badi hai'
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

module.exports = { uploadBlogImage, uploadPortfolioMedia }