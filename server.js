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
    app.use('/src/api/', apiLimiter);

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
    
    // Discovery page route
    app.get('/src/pages/discovery.html', (req, res) => {
        res.sendFile(path.join(__dirname, 'src', 'pages', 'discovery.html'));
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
        const threadQuery = 'SELECT * FROM threads WHERE id = ?';

        pool.query(threadQuery, [threadId], (error, threadResults) => {
            if (error) {
                console.error('Error fetching thread:', error);
                res.status(500).json({ error: 'Failed to fetch thread' });
                return;
            }

            if (threadResults.length === 0) {
                res.status(404).json({ error: 'Thread not found' });
                return;
            }

            // Fetch posts for this thread
            const postsQuery = 'SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC';
            pool.query(postsQuery, [threadId], (postsError, postsResults) => {
                if (postsError) {
                    console.error('Error fetching posts:', postsError);
                    res.status(500).json({ error: 'Failed to fetch posts' });
                    return;
                }

                // Add posts as comments to thread response
                const thread = threadResults[0];
                thread.comments = postsResults;
                res.json(thread);
            });
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

    app.post('/api/forum/threads/:id/posts', forumLimiter, [
        body('content').isLength({ min: 5 }).withMessage('Post content must be at least 5 characters')
    ], (req, res) => {
        const threadId = req.params.id;
        const { content, author } = req.body;

        // If author is not provided, use "Anonymous"
        const commentAuthor = author || "Anonymous";

        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }

        const query = 'INSERT INTO posts (thread_id, content, author) VALUES (?, ?, ?)';
        pool.query(query, [threadId, content, commentAuthor], (error, results) => {
            if (error) {
                console.error('Error creating post:', error);
                res.status(500).json({ error: 'Failed to create post' });
                return;
            }
            res.status(201).json({ 
                id: results.insertId, 
                thread_id: threadId, 
                content, 
                author: commentAuthor,
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
        });
    });

    // Discovery API endpoints
    app.post('/api/discovery/content', (req, res) => {
        const { contentTypes, energyTypes, sortBy } = req.body;
        
        // In a real implementation, this would query the database based on filters
        // For now, we'll return mock data
        
        const mockTrendingTopics = [
            {
                id: 1,
                title: "Latest developments in hydrogen fuel cell efficiency",
                description: "New research shows a 12% improvement in energy conversion through novel catalyst materials.",
                category: "hydrogen",
                author: "Dr. Elena Rodriguez",
                views: 245,
                comments: 18,
                trend: "+15%",
                icon: "fa-atom",
                color: "#009688"
            },
            {
                id: 2,
                title: "Biofuels from algae: Scaling production challenges",
                description: "New photobioreactor design increases productivity by 35% while reducing water usage.",
                category: "biofuels",
                author: "Prof. James Chen",
                views: 189,
                comments: 12,
                trend: "+22%",
                icon: "fa-leaf",
                color: "#4CAF50"
            },
            {
                id: 3,
                title: "Geothermal energy in cold climates",
                description: "Community heating project in Alaska shows promising results despite efficiency challenges.",
                category: "geothermal",
                author: "Sarah Kim",
                views: 156,
                comments: 9,
                trend: "+8%",
                icon: "fa-temperature-high",
                color: "#FF9800"
            }
        ];
        
        const mockFeaturedExperts = [
            {
                id: 1,
                name: "Dr. Elena Rodriguez",
                title: "Hydrogen Fuel Cell Researcher",
                bio: "Leading researcher in PEM fuel cell technology with over 15 years of experience in catalyst development.",
                avatar: "/src/assets/images/experts/expert1.jpg",
                followers: 1240,
                articles: 42,
                expertise: ["Hydrogen", "Fuel Cells", "Catalysts"]
            },
            {
                id: 2,
                name: "Prof. James Chen",
                title: "Biofuels Specialist",
                bio: "Expert in algae-based biofuels with a focus on scalable production methods and harvesting techniques.",
                avatar: "/src/assets/images/experts/expert2.jpg",
                followers: 980,
                articles: 35,
                expertise: ["Biofuels", "Algae", "Sustainability"]
            },
            {
                id: 3,
                name: "Sarah Kim",
                title: "Renewable Energy Engineer",
                bio: "Specializes in geothermal systems with experience in extreme climate installations and community projects.",
                avatar: "/src/assets/images/experts/expert3.jpg",
                followers: 756,
                articles: 28,
                expertise: ["Geothermal", "Renewables", "Energy Systems"]
            }
        ];
        
        const mockRecommendedContent = [
            {
                id: 1,
                type: "article",
                title: "The Future of Hydrogen: Opportunities and Challenges",
                description: "An in-depth analysis of the hydrogen economy and its potential to transform the energy sector.",
                category: "Hydrogen",
                author: "Dr. Elena Rodriguez",
                date: "2023-06-15",
                readTime: "8 min",
                views: 1240,
                likes: 87,
                image: "/src/assets/images/content/hydrogen-future.jpg"
            },
            {
                id: 2,
                type: "discussion",
                title: "Is algae the future of sustainable biofuels?",
                description: "Join the discussion on the potential of algae-based biofuels to replace fossil fuels.",
                category: "Biofuels",
                author: "Prof. James Chen",
                date: "2023-06-12",
                readTime: "5 min",
                views: 890,
                likes: 65,
                image: "/src/assets/images/content/algae-biofuels.jpg"
            },
            {
                id: 3,
                type: "resource",
                title: "Geothermal Energy Implementation Guide",
                description: "A comprehensive guide to implementing geothermal energy systems in various climates.",
                category: "Geothermal",
                author: "Sarah Kim",
                date: "2023-06-10",
                readTime: "12 min",
                views: 670,
                likes: 43,
                image: "/src/assets/images/content/geothermal-guide.jpg"
            },
            {
                id: 4,
                type: "article",
                title: "Solar Panel Efficiency: Recent Breakthroughs",
                description: "Exploring the latest technological advances in photovoltaic cell efficiency.",
                category: "Solar",
                author: "Dr. Michael Johnson",
                date: "2023-06-08",
                readTime: "7 min",
                views: 1120,
                likes: 78,
                image: "/src/assets/images/content/solar-efficiency.jpg"
            },
            {
                id: 5,
                type: "discussion",
                title: "Wind energy in urban environments",
                description: "Discussing the challenges and opportunities of implementing wind turbines in cities.",
                category: "Wind",
                author: "Alex Thompson",
                date: "2023-06-05",
                readTime: "4 min",
                views: 560,
                likes: 32,
                image: "/src/assets/images/content/urban-wind.jpg"
            },
            {
                id: 6,
                type: "resource",
                title: "Nuclear Energy Safety Standards",
                description: "A comprehensive overview of modern nuclear safety protocols and regulations.",
                category: "Nuclear",
                author: "Dr. Rebecca Lee",
                date: "2023-06-02",
                readTime: "15 min",
                views: 830,
                likes: 54,
                image: "/src/assets/images/content/nuclear-safety.jpg"
            }
        ];
        
        // Filter content based on user selections
        const filteredTrendingTopics = mockTrendingTopics.filter(topic => {
            return energyTypes.includes(topic.category);
        });
        
        const filteredFeaturedExperts = mockFeaturedExperts.filter(expert => {
            if (!contentTypes.includes('experts')) return false;
            return expert.expertise.some(expertise => {
                const expertiseLower = expertise.toLowerCase();
                return energyTypes.some(energyType => expertiseLower.includes(energyType));
            });
        });
        
        const filteredRecommendedContent = mockRecommendedContent.filter(content => {
            if (!contentTypes.includes(content.type)) return false;
            return energyTypes.some(energyType => 
                content.category.toLowerCase() === energyType.toLowerCase()
            );
        });
        
        // Sort content based on user selection
        const sortContent = (content) => {
            switch(sortBy) {
                case 'trending':
                    return content.sort((a, b) => {
                        const aTrend = parseInt(a.trend?.replace('+', '').replace('%', '') || 0);
                        const bTrend = parseInt(b.trend?.replace('+', '').replace('%', '') || 0);
                        return bTrend - aTrend;
                    });
                case 'recent':
                    return content.sort((a, b) => new Date(b.date) - new Date(a.date));
                case 'popular':
                    return content.sort((a, b) => b.views - a.views);
                case 'relevant':
                    return content.sort((a, b) => b.likes - a.likes);
                default:
                    return content;
            }
        };
        
        res.json({
            trendingTopics: sortContent(filteredTrendingTopics),
            featuredExperts: filteredFeaturedExperts,
            recommendedContent: sortContent(filteredRecommendedContent)
        });
    });

    // Expert follow/unfollow endpoints
    app.post('/api/experts/follow', authenticateToken, (req, res) => {
        const { expertId } = req.body;
        const userId = req.user.id;
        
        if (!expertId) {
            return res.status(400).json({ error: 'Expert ID is required' });
        }
        
        // In a real implementation, this would update the database
        // For now, we'll just return a success response
        console.log(`User ${userId} following expert ${expertId}`);
        
        res.json({ success: true, message: 'Expert followed successfully' });
    });
    
    app.post('/api/experts/unfollow', authenticateToken, (req, res) => {
        const { expertId } = req.body;
        const userId = req.user.id;
        
        if (!expertId) {
            return res.status(400).json({ error: 'Expert ID is required' });
        }
        
        // In a real implementation, this would update the database
        // For now, we'll just return a success response
        console.log(`User ${userId} unfollowing expert ${expertId}`);
        
        res.json({ success: true, message: 'Expert unfollowed successfully' });
    });

    // API endpoint for discovery content
    app.get('/src/api/discovery', (req, res) => {
        // Return default content for initial load
        res.json({
            trendingTopics: [
                {
                    id: 1,
                    title: "Latest developments in hydrogen fuel cell efficiency",
                    description: "New research shows a 12% improvement in energy conversion through novel catalyst materials.",
                    category: "hydrogen",
                    author: "Dr. Elena Rodriguez",
                    views: 245,
                    comments: 18,
                    trend: "+15%",
                    icon: "fa-atom",
                    color: "#009688"
                },
                {
                    id: 2,
                    title: "Biofuels from algae: Scaling production challenges",
                    description: "New photobioreactor design increases productivity by 35% while reducing water usage.",
                    category: "biofuels",
                    author: "Prof. James Chen",
                    views: 189,
                    comments: 12,
                    trend: "+22%",
                    icon: "fa-leaf",
                    color: "#4CAF50"
                },
                {
                    id: 3,
                    title: "Geothermal energy in cold climates",
                    description: "Community heating project in Alaska shows promising results despite efficiency challenges.",
                    category: "geothermal",
                    author: "Sarah Kim",
                    views: 156,
                    comments: 9,
                    trend: "+8%",
                    icon: "fa-temperature-high",
                    color: "#FF9800"
                }
            ],
            featuredExperts: [
                {
                    id: 1,
                    name: "Dr. Elena Rodriguez",
                    title: "Hydrogen Fuel Cell Researcher",
                    bio: "Leading researcher in PEM fuel cell technology with over 15 years of experience in catalyst development.",
                    avatar: "/src/assets/images/experts/expert1.jpg",
                    followers: 1240,
                    articles: 42,
                    expertise: ["Hydrogen", "Fuel Cells", "Catalysts"]
                },
                {
                    id: 2,
                    name: "Prof. James Chen",
                    title: "Biofuels Specialist",
                    bio: "Expert in algae-based biofuels with a focus on scalable production methods and harvesting techniques.",
                    avatar: "/src/assets/images/experts/expert2.jpg",
                    followers: 980,
                    articles: 35,
                    expertise: ["Biofuels", "Algae", "Sustainability"]
                },
                {
                    id: 3,
                    name: "Sarah Kim",
                    title: "Renewable Energy Engineer",
                    bio: "Specializes in geothermal systems with experience in extreme climate installations and community projects.",
                    avatar: "/src/assets/images/experts/expert3.jpg",
                    followers: 756,
                    articles: 28,
                    expertise: ["Geothermal", "Renewables", "Energy Systems"]
                }
            ],
            recommendedContent: [
                {
                    id: 1,
                    type: "article",
                    title: "The Future of Hydrogen: Opportunities and Challenges",
                    description: "An in-depth analysis of the hydrogen economy and its potential to transform the energy sector.",
                    category: "Hydrogen",
                    author: "Dr. Elena Rodriguez",
                    date: "2023-06-15",
                    readTime: "8 min",
                    views: 1240,
                    likes: 87,
                    image: "/src/assets/images/content/hydrogen-future.jpg"
                },
                {
                    id: 2,
                    type: "discussion",
                    title: "Is algae the future of sustainable biofuels?",
                    description: "Join the discussion on the potential of algae-based biofuels to replace fossil fuels.",
                    category: "Biofuels",
                    author: "Prof. James Chen",
                    date: "2023-06-12",
                    readTime: "5 min",
                    views: 890,
                    likes: 65,
                    image: "/src/assets/images/content/algae-biofuels.jpg"
                },
                {
                    id: 3,
                    type: "resource",
                    title: "Geothermal Energy Implementation Guide",
                    description: "A comprehensive guide to implementing geothermal energy systems in various climates.",
                    category: "Geothermal",
                    author: "Sarah Kim",
                    date: "2023-06-10",
                    readTime: "12 min",
                    views: 670,
                    likes: 43,
                    image: "/src/assets/images/content/geothermal-guide.jpg"
                }
            ]
        });
    });
    
    // POST endpoint for filtered discovery content
    app.post('/src/api/discovery', (req, res) => {
        const { contentTypes, energyTypes, sortBy } = req.body;
        
        // In a real implementation, this would filter and sort content from database
        // For now, we'll just return the same content
        res.json({
            trendingTopics: [
                {
                    id: 1,
                    title: "Latest developments in hydrogen fuel cell efficiency",
                    description: "New research shows a 12% improvement in energy conversion through novel catalyst materials.",
                    category: "hydrogen",
                    author: "Dr. Elena Rodriguez",
                    views: 245,
                    comments: 18,
                    trend: "+15%",
                    icon: "fa-atom",
                    color: "#009688"
                },
                {
                    id: 2,
                    title: "Biofuels from algae: Scaling production challenges",
                    description: "New photobioreactor design increases productivity by 35% while reducing water usage.",
                    category: "biofuels",
                    author: "Prof. James Chen",
                    views: 189,
                    comments: 12,
                    trend: "+22%",
                    icon: "fa-leaf",
                    color: "#4CAF50"
                },
                {
                    id: 3,
                    title: "Geothermal energy in cold climates",
                    description: "Community heating project in Alaska shows promising results despite efficiency challenges.",
                    category: "geothermal",
                    author: "Sarah Kim",
                    views: 156,
                    comments: 9,
                    trend: "+8%",
                    icon: "fa-temperature-high",
                    color: "#FF9800"
                }
            ],
            featuredExperts: [
                {
                    id: 1,
                    name: "Dr. Elena Rodriguez",
                    title: "Hydrogen Fuel Cell Researcher",
                    bio: "Leading researcher in PEM fuel cell technology with over 15 years of experience in catalyst development.",
                    avatar: "/src/assets/images/experts/expert1.jpg",
                    followers: 1240,
                    articles: 42,
                    expertise: ["Hydrogen", "Fuel Cells", "Catalysts"]
                },
                {
                    id: 2,
                    name: "Prof. James Chen",
                    title: "Biofuels Specialist",
                    bio: "Expert in algae-based biofuels with a focus on scalable production methods and harvesting techniques.",
                    avatar: "/src/assets/images/experts/expert2.jpg",
                    followers: 980,
                    articles: 35,
                    expertise: ["Biofuels", "Algae", "Sustainability"]
                },
                {
                    id: 3,
                    name: "Sarah Kim",
                    title: "Renewable Energy Engineer",
                    bio: "Specializes in geothermal systems with experience in extreme climate installations and community projects.",
                    avatar: "/src/assets/images/experts/expert3.jpg",
                    followers: 756,
                    articles: 28,
                    expertise: ["Geothermal", "Renewables", "Energy Systems"]
                }
            ],
            recommendedContent: [
                {
                    id: 1,
                    type: "article",
                    title: "The Future of Hydrogen: Opportunities and Challenges",
                    description: "An in-depth analysis of the hydrogen economy and its potential to transform the energy sector.",
                    category: "Hydrogen",
                    author: "Dr. Elena Rodriguez",
                    date: "2023-06-15",
                    readTime: "8 min",
                    views: 1240,
                    likes: 87,
                    image: "/src/assets/images/content/hydrogen-future.jpg"
                },
                {
                    id: 2,
                    type: "discussion",
                    title: "Is algae the future of sustainable biofuels?",
                    description: "Join the discussion on the potential of algae-based biofuels to replace fossil fuels.",
                    category: "Biofuels",
                    author: "Prof. James Chen",
                    date: "2023-06-12",
                    readTime: "5 min",
                    views: 890,
                    likes: 65,
                    image: "/src/assets/images/content/algae-biofuels.jpg"
                },
                {
                    id: 3,
                    type: "resource",
                    title: "Geothermal Energy Implementation Guide",
                    description: "A comprehensive guide to implementing geothermal energy systems in various climates.",
                    category: "Geothermal",
                    author: "Sarah Kim",
                    date: "2023-06-10",
                    readTime: "12 min",
                    views: 670,
                    likes: 43,
                    image: "/src/assets/images/content/geothermal-guide.jpg"
                }
            ]
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



    // Note: The service worker is now only available at /src/sw.js

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
