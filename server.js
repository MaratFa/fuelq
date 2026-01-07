const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./middleware/auth');
const { apiLimiter, loginLimiter, forumLimiter } = require('./middleware/rateLimiter');
const { body, validationResult } = require('express-validator');
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

    // Apply rate limiting to all API routes
    app.use('/api/', apiLimiter);

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

    // Database connection pool with environment variables
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fuelq',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Test database connection
    pool.getConnection((error, connection) => {
        if (error) {
            console.error('Error connecting to the database: ' + error.stack);
            return;
        }
        console.log('Successfully connected to database.');
        connection.release();
    });

    // API Routes
    app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Authentication endpoints
    app.post('/api/auth/register', loginLimiter, [
        body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ], async (req, res) => {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Username, email, and password are required' });
            }

            // Check if user already exists
            const checkUserQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
            pool.query(checkUserQuery, [username, email], async (error, results) => {
                if (error) {
                    console.error('Error checking user:', error);
                    return res.status(500).json({ error: 'Failed to register user' });
                }

                if (results.length > 0) {
                    return res.status(409).json({ error: 'Username or email already exists' });
                }

                // Hash password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Create user
                const createUserQuery = 'INSERT INTO users (username, email, password, firstName, lastName, dateJoined) VALUES (?, ?, ?, ?, ?, ?)';
                const dateJoined = Date.now();
                pool.query(createUserQuery, [username, email, hashedPassword, firstName, lastName, dateJoined], (error, results) => {
                    if (error) {
                        console.error('Error creating user:', error);
                        return res.status(500).json({ error: 'Failed to register user' });
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        { id: results.insertId, username, email },
                        process.env.JWT_SECRET || 'default_secret',
                        { expiresIn: '24h' }
                    );

                    return res.status(201).json({
                        message: 'User registered successfully',
                        token,
                        user: {
                            id: results.insertId,
                            username,
                            email,
                            firstName,
                            lastName
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/auth/login', loginLimiter, [
        body('username').notEmpty().withMessage('Username or email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ], async (req, res) => {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            // Find user
            const findUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
            pool.query(findUserQuery, [username, username], async (error, results) => {
                if (error) {
                    console.error('Error finding user:', error);
                    return res.status(500).json({ error: 'Failed to login' });
                }

                if (results.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const user = results[0];

                // Compare password
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Update last login
                const updateLoginQuery = 'UPDATE users SET lastLogin = ? WHERE id = ?';
                pool.query(updateLoginQuery, [Date.now(), user.id], (error) => {
                    if (error) {
                        console.error('Error updating last login:', error);
                    }
                });

                // Generate JWT token
                const token = jwt.sign(
                    { id: user.id, username: user.username, email: user.email },
                    process.env.JWT_SECRET || 'default_secret',
                    { expiresIn: '24h' }
                );

                return res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                });
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Forum API routes
    app.get('/api/forum/threads', (req, res) => {
        const query = 'SELECT * FROM threads ORDER BY created_at DESC';
        pool.query(query, (error, results) => {
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
        pool.query(query, [threadId], (error, results) => {
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
        pool.query(query, [threadId], (error, results) => {
            if (error) {
                console.error('Error fetching posts:', error);
                res.status(500).json({ error: 'Failed to fetch posts' });
                return;
            }
            res.json(results);
        });
    });

    app.post('/api/forum/threads', authenticateToken, forumLimiter, [
        body('title').isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
        body('content').isLength({ min: 10 }).withMessage('Content must be at least 10 characters')
    ], (req, res) => {
        const { title, content } = req.body;
        const author = req.user.username; // Use authenticated user's username

        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }

        const query = 'INSERT INTO threads (title, content, author) VALUES (?, ?, ?)';
        pool.query(query, [title, content, author], (error, results) => {
            if (error) {
                console.error('Error creating thread:', error);
                res.status(500).json({ error: 'Failed to create thread' });
                return;
            }
            res.status(201).json({ id: results.insertId, title, content, author });
        });
    });

    app.post('/api/forum/threads/:id/posts', authenticateToken, forumLimiter, [
        body('content').isLength({ min: 5 }).withMessage('Post content must be at least 5 characters')
    ], (req, res) => {
        const threadId = req.params.id;
        const { content } = req.body;
        const author = req.user.username; // Use authenticated user's username

        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }

        const query = 'INSERT INTO posts (thread_id, content, author) VALUES (?, ?, ?)';
        pool.query(query, [threadId, content, author], (error, results) => {
            if (error) {
                console.error('Error creating post:', error);
                res.status(500).json({ error: 'Failed to create post' });
                return;
            }
            res.status(201).json({ id: results.insertId, thread_id: threadId, content, author });
        });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something went wrong!' });
    });

    // Validation error handling middleware
    app.use((req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
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

    // Note: The root /sw.js endpoint has been removed as it was only for backward compatibility

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
            pool.end();
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        server.close(() => {
            console.log('Process terminated');
            pool.end();
            process.exit(0);
        });
    });

    return server;
}

// Start the server
const server = startServer();

// Export for testing purposes
module.exports = server;
