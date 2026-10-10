const cloudinary = require('../config/cloudinary')

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB (Cloudinary free plan limit)

// Memory me aayi file (buffer) ko Cloudinary pe upload karta hai, secure URL return karta hai
const uploadToCloudinary = (file, folder) => {
    const isVideo = file.mimetype.startsWith('video/')

    if (!isVideo && file.size > MAX_IMAGE_SIZE) {
        return Promise.reject(new Error(`Image "${file.originalname}" 10MB se badi hai`))
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `qcs/${folder}`, resource_type: isVideo ? 'video' : 'image' },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
        )
        stream.end(file.buffer)
    })
}

// Resume (pdf / doc / docx) ko "raw" file ki tarah upload karta hai, secure URL return karta hai
const uploadRawToCloudinary = (file, folder) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `qcs/${folder}`,
                resource_type: 'raw',
                public_id: `${Date.now()}-${safeName}`, // extension ke saath, taaki link .pdf pe khatam ho
            },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
        )
        stream.end(file.buffer)
    })
}

// Ek saath kai files upload
const uploadManyToCloudinary = (files = [], folder) =>
    Promise.all(files.map((f) => uploadToCloudinary(f, folder)))

// Cloudinary URL se public_id nikal kar file delete karta hai
// Image/Video URL: https://res.cloudinary.com/<cloud>/<image|video>/upload/v123/qcs/blog/abc.jpg
// Raw (resume) URL: https://res.cloudinary.com/<cloud>/raw/upload/v123/qcs/resumes/123-cv.pdf
const deleteFromCloudinary = async (url) => {
    if (!url || !url.includes('res.cloudinary.com')) return // purane external URLs ko ignore

    // Raw files (resume): public_id me extension bhi shamil hota hai
    const rawMatch = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/)
    if (rawMatch) {
        try {
            await cloudinary.uploader.destroy(rawMatch[1], { resource_type: 'raw' })
        } catch (err) {
            console.error('Cloudinary raw delete failed:', err.message)
        }
        return
    }

    // Image / Video
    const match = url.match(/\/(image|video)\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/)
    if (!match) return
    const [, resourceType, publicId] = match
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    } catch (err) {
        console.error('Cloudinary delete failed:', err.message)
    }
}

const deleteManyFromCloudinary = (urls = []) =>
    Promise.all(urls.map((u) => deleteFromCloudinary(u)))

module.exports = {
    uploadToCloudinary,
    uploadRawToCloudinary,
    uploadManyToCloudinary,
    deleteFromCloudinary,
    deleteManyFromCloudinary,
}