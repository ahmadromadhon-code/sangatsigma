const express = require('express')
const app = express()
const port = process.env.PORT || 3002
const router = require('./routes/index')
const cors = require('cors')
const path = require('path')




// Enhanced CORS for mobile access
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Add headers for mobile compatibility
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
})

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')))

// Use router both with and without /api prefix for compatibility
app.use('/api',router)
app.use('/',router)

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Nekopoi routes are now handled by routes/index.js

// Nekopoi search route handled by routes/index.js

// Nekopoi info route handled by routes/index.js

// Nekopoi random route handled by routes/index.js



app.use('*',(req,res) =>{
    res.json({
        'status':'not found path',
        message: 'Welcome to AncientNime API - Anime streaming service'
    })
})
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`)
    console.log(`Local: http://localhost:${port}`)
    console.log(`Network: http://[YOUR_IP]:${port}`)
    console.log(`API endpoints:`)
    console.log(`- GET /api/home - Home data`)
    console.log(`- GET /api/ongoing/:page - Ongoing anime`)
    console.log(`- GET /api/complete/:page - Complete anime`)
    console.log(`- GET /api/search/:query - Search anime`)
})