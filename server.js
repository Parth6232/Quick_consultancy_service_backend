require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')
const blogRoutes = require('./routes/blogRoutes')
const portfolioRoutes = require('./routes/portfolioRoutes')
const authRoutes = require('./routes/authRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const jobRoutes = require('./routes/jobRoutes')
const applicationRoutes = require('./routes/applicationRoutes')

connectDB()

const app = express()

// Allowed origins: CLIENT_URL can be comma-separated list (env) + defaults
const allowedOrigins = [
    'http://localhost:5173',
    'https://www.quickconsulting.in',
    'https://quickconsulting.in',
    'https://quick-consultancy-service.vercel.app',
    ...(process.env.CLIENT_URL || '').split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean),
]

const corsOptions = {
    origin: (origin, callback) => {
        // allow tools like Postman / server-to-server (no origin)
        if (!origin) return callback(null, true)
        // allow listed origins + any Vercel preview deployment of this project
        if (
            allowedOrigins.includes(origin) ||
            /^https:\/\/quick-consultancy-service[a-z0-9-]*\.vercel\.app$/.test(origin)
        ) {
            return callback(null, true)
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
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
app.use('/api/reviews', reviewRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))