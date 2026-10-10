import cloudinary from '../config/cloudinary.js'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB (Cloudinary free plan limit)

// Memory me aayi file (buffer) ko Cloudinary pe upload karta hai, secure URL return karta hai
export const uploadToCloudinary = (file, folder) => {
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

// Ek saath kai files upload
export const uploadManyToCloudinary = (files = [], folder) =>
    Promise.all(files.map((f) => uploadToCloudinary(f, folder)))

// Cloudinary URL se public_id nikal kar file delete karta hai
// URL format: https://res.cloudinary.com/<cloud>/<image|video>/upload/v123/qcs/blog/abc.jpg
export const deleteFromCloudinary = async (url) => {
    if (!url || !url.includes('res.cloudinary.com')) return // purane external URLs ko ignore
    const match = url.match(/\/(image|video)\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/)
    if (!match) return
    const [, resourceType, publicId] = match
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    } catch (err) {
        console.error('Cloudinary delete failed:', err.message)
    }
}

export const deleteManyFromCloudinary = (urls = []) =>
    Promise.all(urls.map((u) => deleteFromCloudinary(u)))