import mongoose from 'mongoose'
import dotenv from 'dotenv'
import BlogPost from './models/BlogPost.js'
import Portfolio from './models/Portfolio.js'

dotenv.config()

const blogs = [
  {
    title: '5 GST Filing Mistakes That Could Cost Your Business',
    content:
      "Late filings, wrong ITC claims, and mismatched invoices are the most common reasons businesses face GST penalties. Here's how Quick Consulting Services helps you avoid every one of them with proactive compliance checks and monthly reconciliation.",
    author: 'CA Ritika Sharma',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
  },
  {
    title: 'How AI Automation is Transforming Small Business Operations in India',
    content:
      'From automated invoicing to AI-driven customer support, small businesses across India are cutting operational costs by up to 40%. We break down the tools and workflows that make the biggest difference.',
    author: 'Quick Consulting Team',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
  },
]

const portfolio = [
  {
    title: 'GST Registration & Compliance Overhaul',
    description:
      'Complete GST registration, monthly return filing setup, and reconciliation process for a growing retail chain in Indore.',
    category: 'Tax & Compliance',
    client: 'Shree Retail Pvt Ltd',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
  },
  {
    title: 'AI Chatbot Integration for Customer Support',
    description:
      'Designed and deployed a custom AI chatbot handling 70% of routine customer queries, reducing response time from hours to seconds.',
    category: 'AI Automation',
    client: 'TechNova Solutions',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a',
  },
]

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  await BlogPost.deleteMany({})
  await Portfolio.deleteMany({})
  await BlogPost.insertMany(blogs)
  await Portfolio.insertMany(portfolio)
  console.log('Seed data inserted successfully')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
