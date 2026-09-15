import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import blogRoutes from './routes/blogRoutes.js'
import portfolioRoutes from './routes/portfolioRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Health check - confirms server is up
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'QCS backend running' })
})

app.use('/api/blogs', blogRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))