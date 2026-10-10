import { v2 as cloudinary } from 'cloudinary'

// dotenv.config() server.js me already chal chuka hota hai
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

export default cloudinary