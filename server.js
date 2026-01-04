const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Function to start the server
function startServer() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(cors());
    app.use(bodyParser.json());

    // Serve static files from multiple directories
    // Handle paths with /src prefix
    app.use('/src/assets', express.static(path.join(__dirname, 'src', 'assets')));
    app.use('/src/components', express.static(path.join(__dirname, 'src', 'components')));

    // Handle paths without /src prefix
    app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));
    app.use('/components', express.static(path.join(__dirname, 'src', 'components')));

    // Serve other static files
    app.use(express.static(path.join(__dirname)));
    app.use(express.static(path.join(__dirname, 'src')));

    // Set MIME type for JavaScript modules
    app.use('*.js', (req, res, next) => {
        res.type('application/javascript');
        next();
    });

    // Set MIME type for mjs files (ES6 modules)
    app.use('*.mjs', (req, res, next) => {
        res.type('application/javascript');
        next();
    });

    // Database connection with environment variables
    const connection = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fuelq'
    });

    // Connect to database
    connection.connect(error => {
        if (error) {
            console.error('Error connecting to the database: ' + error.stack);
            return;
        }
        console.log('Successfully connected to database.');
    });

    // API Routes
    app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Forum API routes
    app.get('/api/forum/threads', (req, res) => {
        const query = 'SELECT * FROM threads ORDER BY created_at DESC';
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching threads:', error);
                res.status(500).json({ error: 'Failed to fetch threads' });
                return;
            }
            res.json(results);
        });
    });

    app.get('/api/forum/threads/:id', (req, res) => {
        const threadId = req.params.id;
        const query = 'SELECT * FROM threads WHERE id = ?';
        connection.query(query, [threadId], (error, results) => {
            if (error) {
                console.error('Error fetching thread:', error);
                res.status(500).json({ error: 'Failed to fetch thread' });
                return;
            }
            if (results.length === 0) {
                res.status(404).json({ error: 'Thread not found' });
                return;
            }
            res.json(results[0]);
        });
    });

    app.get('/api/forum/threads/:id/posts', (req, res) => {
        const threadId = req.params.id;
        const query = 'SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC';
        connection.query(query, [threadId], (error, results) => {
            if (error) {
                console.error('Error fetching posts:', error);
                res.status(500).json({ error: 'Failed to fetch posts' });
                return;
            }
            res.json(results);
        });
    });

    app.post('/api/forum/threads', (req, res) => {
        const { title, content, author } = req.body;
        if (!title || !content || !author) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const query = 'INSERT INTO threads (title, content, author) VALUES (?, ?, ?)';
        connection.query(query, [title, content, author], (error, results) => {
            if (error) {
                console.error('Error creating thread:', error);
                res.status(500).json({ error: 'Failed to create thread' });
                return;
            }
            res.status(201).json({ id: results.insertId, title, content, author });
        });
    });

    app.post('/api/forum/threads/:id/posts', (req, res) => {
        const threadId = req.params.id;
        const { content, author } = req.body;
        if (!content || !author) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const query = 'INSERT INTO posts (thread_id, content, author) VALUES (?, ?, ?)';
        connection.query(query, [threadId, content, author], (error, results) => {
            if (error) {
                console.error('Error creating post:', error);
                res.status(500).json({ error: 'Failed to create post' });
                return;
            }
            res.status(201).json({ id: results.insertId, thread_id: threadId, content, author });
        });
    });

    // Contact form endpoint
    app.post('/api/contact', (req, res) => {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // In a real application, you would save this to a database or send an email
        // For now, we'll just log it and return a success response
        console.log('Contact form submission:', { name, email, subject, message });
        res.status(200).json({ success: true, message: 'Contact form submitted successfully' });
    });

    // Service worker endpoints
    app.get('/src/sw.js', (req, res) => {
        res.sendFile(path.join(__dirname, 'src', 'sw.js'));
    });

    // For backward compatibility
    app.get('/sw.js', (req, res) => {
        res.sendFile(path.join(__dirname, 'src', 'sw.js'));
    });

    // Start the server
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Access the application at: http://localhost:${PORT}`);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
            connection.end();
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
            connection.end();
            process.exit(0);
        });
    });

    return server;
}

// Start the server
const server = startServer();

// Export for testing purposes
module.exports = { startServer };
