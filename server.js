import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import blogRoutes from './routes/blogRoutes.js'
import portfolioRoutes from './routes/portfolioRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()
connectDB()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Privacy Policy page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy-policy.html'))
})

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'QCS backend running' })
})

app.use('/api/blogs', blogRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))