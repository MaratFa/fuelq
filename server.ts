import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken, authorizeRole, validateInput, validationRules } from './middleware/auth-enhanced';
import { apiLimiter, loginLimiter, forumLimiter } from './middleware/rateLimiter';
import { body, validationResult } from 'express-validator';
require('dotenv').config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Type definitions
interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    dateJoined?: number;
    lastLogin?: number;
}

interface Thread {
    id: number;
    title: string;
    content: string;
    author: string;
    created_at: Date;
    updated_at?: Date;
    category?: string;
    view_count?: number;
    comment_count?: number;
    comments?: Post[];
}

interface Post {
    id: number;
    thread_id: number;
    content: string;
    author: string;
    created_at: Date;
}

interface TrendingTopic {
    id: number;
    title: string;
    description: string;
    category: string;
    author: string;
    views: number;
    comments: number;
    trend: string;
    icon: string;
    color: string;
    date?: number;
}

interface Expert {
    id: number;
    name: string;
    title: string;
    organization?: string;
    bio: string;
    avatar: string;
    expertise: string[];
    followers: number;
    following: boolean;
}

interface ContentItem {
    id: number;
    type: string;
    title: string;
    author: string;
    date: string;
    category: string;
    thumbnail: string;
    excerpt: string;
    views: number;
    comments: number;
    description?: string;
}

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
    };
}

// Function to start the server
function startServer() {
    const app = express();
    const PORT = process.env.PORT || 3001;

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
    console.log('Initializing database connection with config:', {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD ? '***' : 'EMPTY',
        database: process.env.DB_NAME || 'fuelq',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'fuelq',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Test database connection with retry logic
    let retryCount = 0;
    const maxRetries = 3;

    function testConnection(): void {
        pool.getConnection((error, connection) => {
            if (error) {
                console.error(`Error connecting to database (attempt ${retryCount + 1}/${maxRetries}):`, error);
                console.error('Database configuration:', {
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER || 'root',
                    database: process.env.DB_NAME || 'fuelq'
                });

                if (retryCount < maxRetries - 1) {
                    retryCount++;
                    console.log(`Retrying database connection in 3 seconds...`);
                    setTimeout(testConnection, 3000);
                } else {
                    console.error('Max retries reached. Server will continue without database connection.');
                }
                return;
            }

            console.log('Successfully connected to database.');
            connection.release();

            // Test a simple query
            connection.query('SELECT 1 as test', (err, results) => {
                if (err) {
                    console.error('Database query test failed:', err);
                } else {
                    console.log('Database query test successful:', results);
                }
            });
        });
    }

    testConnection();

    // API Routes
    app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Authentication endpoints
    app.post('/api/auth/register', loginLimiter, validateInput(validationRules.register), async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, email, password, firstName, lastName } = req.body;

            // Validate input
            if (!username || !email || !password) {
                res.status(400).json({ error: 'Username, email, and password are required' });
                return;
            }

            // Check if user already exists
            const checkUserQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
            pool.query(checkUserQuery, [username, email], async (error: any, results: any): Promise<void> => {
                if (error) {
                    console.error('Error checking user:', error);
                    res.status(500).json({ error: 'Failed to register user' });
                    return;
                }

                if (results.length > 0) {
                    res.status(409).json({ error: 'Username or email already exists' });
                    return;
                }

                // Hash password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);

                // Create user
                const createUserQuery = 'INSERT INTO users (username, email, password, firstName, lastName, dateJoined) VALUES (?, ?, ?, ?, ?, ?)';
                const dateJoined = Date.now();
                pool.query(createUserQuery, [username, email, hashedPassword, firstName, lastName, dateJoined], (error, results: any) => {
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

    app.post('/api/auth/login', loginLimiter, validateInput(validationRules.login), async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }

            // Find user
            const findUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
            pool.query(findUserQuery, [username, username], async (error: any, results: any) => {
                if (error) {
                    console.error('Error finding user:', error);
                    return res.status(500).json({ error: 'Failed to login' });
                }

                if (results.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const user: User = results[0];

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
        pool.query(query, (error, results: Thread[]) => {
            if (error) {
                console.error('Error fetching threads:', error);
                res.status(500).json({ error: 'Failed to fetch threads' });
                return;
            }
            res.json(results);
        });
    });

    app.get('/api/forum/threads/:id', (req: Request, res: Response): void => {
        const threadId = req.params.id;
        const threadQuery = 'SELECT * FROM threads WHERE id = ?';

        pool.query(threadQuery, [threadId], (error: any, results: any) => {
            if (error) {
                console.error('Error fetching thread:', error);
                res.status(500).json({ error: 'Failed to fetch thread' });
                return;
            }

            if (results.length === 0) {
                res.status(404).json({ error: 'Thread not found' });
                return;
            }

            // Fetch posts for this thread
            const postsQuery = 'SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC';
            pool.query(postsQuery, [threadId], (postsError: any, postsResults: any) => {
                if (postsError) {
                    console.error('Error fetching posts:', postsError);
                    res.status(500).json({ error: 'Failed to fetch posts' });
                    return;
                }

                // Add posts as comments to thread response
                const thread = results[0];
                if (thread) {
                    thread.comments = postsResults;
                }
                res.json(thread);
            });
        });
    });

    app.get('/api/forum/threads/:id/posts', (req: Request, res: Response): void => {
        const threadId = req.params.id;
        const query = 'SELECT * FROM posts WHERE thread_id = ? ORDER BY created_at ASC';
        pool.query(query, [threadId], (error: any, results: any) => {
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
    ], (req: AuthenticatedRequest, res: Response): void => {
        const { title, content } = req.body;
        const author = req.user?.username || 'Anonymous'; // Use authenticated user's username

        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }

        const query = 'INSERT INTO threads (title, content, author) VALUES (?, ?, ?)';
        pool.query(query, [title, content, author], (error, results: any) => {
            if (error) {
                console.error('Error creating thread:', error);
                res.status(500).json({ error: 'Failed to create thread' });
                return;
            }
            res.status(201).json({ id: results.insertId, title, content, author });
        });
    });

    app.post('/api/forum/threads/:id/posts', forumLimiter, authenticateToken, validateInput(validationRules.forumPost), (req: AuthenticatedRequest, res) => {
        const threadId = req.params.id;
        const { content, author } = req.body;

        // If author is not provided, use authenticated user's username
        const commentAuthor = author || req.user?.username || "Anonymous";

        if (!content) {
            res.status(400).json({ error: 'Content is required' });
            return;
        }

        const query = 'INSERT INTO posts (thread_id, content, author) VALUES (?, ?, ?)';
        pool.query(query, [threadId, content, commentAuthor], (error, results: any) => {
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

        const mockTrendingTopics: TrendingTopic[] = [
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

        const mockFeaturedExperts: Expert[] = [
            {
                id: 1,
                name: "Dr. Elena Rodriguez",
                title: "Hydrogen Fuel Cell Researcher",
                organization: "Energy Research Institute",
                bio: "Leading researcher in PEM fuel cell technology with over 15 years of experience in catalyst development.",
                avatar: "/src/assets/images/experts/expert1.jpg",
                followers: 1240,
                following: false,
                expertise: ["Hydrogen", "Fuel Cells", "Catalysts"]
            },
            {
                id: 2,
                name: "Prof. James Chen",
                title: "Biofuels Specialist",
                organization: "University of Energy Studies",
                bio: "Expert in algae-based biofuels with a focus on scalable production methods and harvesting techniques.",
                avatar: "/src/assets/images/experts/expert2.jpg",
                followers: 980,
                following: false,
                expertise: ["Biofuels", "Algae", "Sustainability"]
            },
            {
                id: 3,
                name: "Sarah Kim",
                title: "Renewable Energy Engineer",
                organization: "Renewable Energy Solutions",
                bio: "Specializes in geothermal systems with experience in extreme climate installations and community projects.",
                avatar: "/src/assets/images/experts/expert3.jpg",
                followers: 756,
                following: false,
                expertise: ["Geothermal", "Renewables", "Energy Systems"]
            }
        ];

        const mockRecommendedContent: ContentItem[] = [
            {
                id: 1,
                type: "article",
                title: "The Future of Hydrogen: Opportunities and Challenges",
                author: "Dr. Elena Rodriguez",
                date: "2023-06-15",
                category: "Hydrogen",
                thumbnail: "/src/assets/images/content/hydrogen-future.jpg",
                excerpt: "An in-depth analysis of the hydrogen economy and its potential to transform the energy sector.",
                views: 1240,
                comments: 87
            },
            {
                id: 2,
                type: "discussion",
                title: "Is algae the future of sustainable biofuels?",
                author: "Prof. James Chen",
                date: "2023-06-12",
                category: "Biofuels",
                thumbnail: "/src/assets/images/content/algae-biofuels.jpg",
                excerpt: "Join the discussion on the potential of algae-based biofuels to replace fossil fuels.",
                views: 890,
                comments: 65
            },
            {
                id: 3,
                type: "resource",
                title: "Geothermal Energy Implementation Guide",
                author: "Sarah Kim",
                date: "2023-06-10",
                category: "Geothermal",
                thumbnail: "/src/assets/images/content/geothermal-guide.jpg",
                excerpt: "A comprehensive guide to implementing geothermal energy systems in various climates.",
                views: 670,
                comments: 43
            },
            {
                id: 4,
                type: "article",
                title: "Solar Panel Efficiency: Recent Breakthroughs",
                author: "Dr. Michael Johnson",
                date: "2023-06-08",
                category: "Solar",
                thumbnail: "/src/assets/images/content/solar-efficiency.jpg",
                excerpt: "Exploring the latest technological advances in photovoltaic cell efficiency.",
                views: 1120,
                comments: 78
            },
            {
                id: 5,
                type: "discussion",
                title: "Wind energy in urban environments",
                author: "Alex Thompson",
                date: "2023-06-05",
                category: "Wind",
                thumbnail: "/src/assets/images/content/urban-wind.jpg",
                excerpt: "Discussing the challenges and opportunities of implementing wind turbines in cities.",
                views: 560,
                comments: 32
            },
            {
                id: 6,
                type: "resource",
                title: "Nuclear Energy Safety Standards",
                author: "Dr. Rebecca Lee",
                date: "2023-06-02",
                category: "Nuclear",
                thumbnail: "/src/assets/images/content/nuclear-safety.jpg",
                excerpt: "A comprehensive overview of modern nuclear safety protocols and regulations.",
                views: 830,
                comments: 54
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
                return energyTypes.some((energyType: string) => expertiseLower.includes(energyType));
            });
        });

        const filteredRecommendedContent = mockRecommendedContent.filter(content => {
            if (!contentTypes.includes(content.type)) return false;
            return energyTypes.some((energyType: string) =>
                content.category.toLowerCase() === energyType.toLowerCase()
            );
        });

        // Sort content based on user selection
        const sortContent = (content: any[]) => {
            switch(sortBy) {
                case 'trending':
                    return content.sort((a, b) => {
                        const aTrend = parseInt(a.trend?.replace('+', '').replace('%', '') || 0);
                        const bTrend = parseInt(b.trend?.replace('+', '').replace('%', '') || 0);
                        return bTrend - aTrend;
                    });
                case 'recent':
                    return content.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                case 'popular':
                    return content.sort((a, b) => b.views - a.views);
                case 'relevant':
                    return content.sort((a, b) => b.comments - a.comments);
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
    app.post('/api/experts/follow', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
        const { expertId } = req.body;
        const userId = req.user?.id;

        if (!expertId) {
            res.status(400).json({ error: 'Expert ID is required' });
            return;
        }

        // In a real implementation, this would update the database
        // For now, we'll just return a success response
        console.log(`User ${userId} following expert ${expertId}`);

        res.json({ success: true, message: 'Expert followed successfully' });
    });

    app.post('/api/experts/unfollow', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
        const { expertId } = req.body;
        const userId = req.user?.id;

        if (!expertId) {
            res.status(400).json({ error: 'Expert ID is required' });
            return;
        }

        // In a real implementation, this would update the database
        // For now, we'll just return a success response
        console.log(`User ${userId} unfollowing expert ${expertId}`);

        res.json({ success: true, message: 'Expert unfollowed successfully' });
    });

    // Helper function to get trending topics
    function getTrendingTopics(): TrendingTopic[] {
        return [
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
                    trend: "+8%",
                    icon: "fa-leaf",
                    color: "#4CAF50"
                },
                {
                    id: 3,
                    title: "Perovskite solar cells in commercial applications",
                    description: "Recent advances in stability make perovskite cells viable for commercial deployment.",
                    category: "solar",
                    author: "Dr. Lisa Park",
                    views: 312,
                    comments: 27,
                    trend: "+22%",
                    icon: "fa-sun",
                    color: "#FFC107"
                },
                {
                    id: 4,
                    title: "Vertical axis wind turbines for urban environments",
                    description: "New designs show improved efficiency in turbulent urban wind conditions.",
                    category: "wind",
                    author: "Jennifer Wu",
                    views: 156,
                    comments: 9,
                    trend: "+12%",
                    icon: "fa-wind",
                    color: "#2196F3"
                },
                {
                    id: 5,
                    title: "Small modular reactors: The future of nuclear energy",
                    description: "Fourth-generation SMRs offer enhanced safety and reduced construction costs.",
                    category: "nuclear",
                    author: "Dr. James Foster",
                    views: 278,
                    comments: 21,
                    trend: "+18%",
                    icon: "fa-radiation",
                    color: "#9C27B0"
                }
            ];
    }

    // Helper function to get featured experts
    function getFeaturedExperts(): Expert[] {
        return [
            {
                id: 1,
                name: "Dr. Elena Rodriguez",
                title: "Hydrogen Fuel Cell Researcher",
                organization: "Energy Research Institute",
                avatar: "/src/assets/images/default-avatar.png",
                expertise: ["Hydrogen", "Fuel Cells", "Catalysis"],
                bio: "Leading researcher in PEM fuel cell technology with 15 years of experience",
                followers: 842,
                following: false
            },
            {
                id: 2,
                name: "Prof. James Chen",
                title: "Alternative Energy Specialist",
                organization: "University of Energy Studies",
                avatar: "/src/assets/images/default-avatar.png",
                expertise: ["Solar", "Wind", "Energy Storage"],
                bio: "Expert in renewable energy systems and grid integration",
                followers: 1205,
                following: false
            },
            {
                id: 3,
                name: "Dr. Amara Okonkwo",
                title: "Biofuels Research Director",
                organization: "Sustainable Fuels Lab",
                avatar: "/src/assets/images/default-avatar.png",
                expertise: ["Biofuels", "Sustainability", "Algae"],
                bio: "Pioneering work in third-generation biofuel development",
                followers: 678,
                following: false
            },
            {
                id: 4,
                name: "Dr. Lisa Park",
                title: "Solar Energy Researcher",
                organization: "Advanced Materials Lab",
                avatar: "/src/assets/images/default-avatar.png",
                expertise: ["Solar", "Perovskites", "Materials Science"],
                bio: "Specialist in next-generation photovoltaic materials",
                followers: 934,
                following: false
            },
            {
                id: 5,
                name: "Jennifer Wu",
                title: "Wind Energy Engineer",
                organization: "Urban Wind Solutions",
                avatar: "/src/assets/images/default-avatar.png",
                expertise: ["Wind", "Urban Energy", "Turbine Design"],
                bio: "Expert in wind energy systems for urban environments",
                followers: 521,
                following: false
            }
        ];
    }

    // Helper function to get recommended content
    function getRecommendedContent(): ContentItem[] {
        return [
            {
                id: 1,
                type: "discussion",
                title: "Comparing energy storage solutions for grid applications",
                author: "Dr. Hassan Al-Mansour",
                date: "2023-06-15",
                category: "general",
                thumbnail: "/src/assets/images/default-resource.png",
                excerpt: "Analysis of battery, hydrogen, and pumped hydro storage options",
                views: 542,
                comments: 23
            },
            {
                id: 2,
                type: "article",
                title: "The future of small modular nuclear reactors",
                author: "Dr. James Foster",
                date: "2023-06-10",
                category: "nuclear",
                thumbnail: "/src/assets/images/default-resource.png",
                excerpt: "How SMRs could transform the energy landscape",
                views: 892,
                comments: 45
            },
            {
                id: 3,
                type: "resource",
                title: "Complete guide to ammonia as energy carrier",
                author: "Dr. Sarah Kim",
                date: "2023-06-05",
                category: "ammonia",
                thumbnail: "/src/assets/images/default-resource.png",
                excerpt: "Technical overview of production, storage, and applications",
                views: 721,
                comments: 18
            },
            {
                id: 4,
                type: "discussion",
                title: "Hydrogen infrastructure challenges and solutions",
                author: "Michael Thompson",
                date: "2023-05-28",
                category: "hydrogen",
                thumbnail: "/src/assets/images/default-resource.png",
                excerpt: "Exploring the obstacles to widespread hydrogen adoption",
                views: 435,
                comments: 31
            },
            {
                id: 5,
                type: "article",
                title: "Advances in perovskite solar cell stability",
                author: "Dr. Lisa Park",
                date: "2023-05-22",
                category: "solar",
                thumbnail: "/src/assets/images/default-resource.png",
                excerpt: "New encapsulation techniques extend lifespan to 20+ years",
                views: 657,
                comments: 27
            }
        ];
    }

    // Helper function to get personalized recommendations
    function getPersonalizedRecommendations(req: Request): ContentItem[] {
        // In a real implementation, this would use user data and browsing history
        // For now, we'll just return an empty array
        return [];
    }

    // API endpoint for discovery content
    app.get('/src/api/discovery', (req, res) => {
        // Get search query and filters from request
        const { search, contentType, energyType, sortBy } = req.query;

        // Get base content
        const trendingTopics = getTrendingTopics();
        const featuredExperts = getFeaturedExperts();
        const recommendedContent = getRecommendedContent();

        // Filter content if search or filters are provided
        let filteredTrendingTopics = trendingTopics;
        let filteredFeaturedExperts = featuredExperts;
        let filteredRecommendedContent = recommendedContent;

        if (search) {
            const searchTerm = (search as string).toLowerCase();

            // Filter trending topics
            filteredTrendingTopics = trendingTopics.filter(topic =>
                topic.title.toLowerCase().includes(searchTerm) ||
                topic.description.toLowerCase().includes(searchTerm)
            );

            // Filter featured experts
            filteredFeaturedExperts = featuredExperts.filter(expert =>
                expert.name.toLowerCase().includes(searchTerm) ||
                expert.bio.toLowerCase().includes(searchTerm)
            );

            // Filter recommended content
            filteredRecommendedContent = recommendedContent.filter(content =>
                content.title.toLowerCase().includes(searchTerm) ||
                content.excerpt.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by content type if specified
        if (contentType) {
            const types = (contentType as string).split(',');

            // Only filter content items if experts is not selected
            if (!types.includes('experts')) {
                filteredFeaturedExperts = [];
            }

            // Only filter content items if discussions is not selected
            if (!types.includes('discussions')) {
                filteredTrendingTopics = [];
            }

            // Only filter content items if articles is not selected
            if (!types.includes('articles')) {
                filteredRecommendedContent = filteredRecommendedContent.filter(
                    content => content.type !== 'article'
                );
            }

            // Only filter content items if resources is not selected
            if (!types.includes('resources')) {
                filteredRecommendedContent = filteredRecommendedContent.filter(
                    content => content.type !== 'resource'
                );
            }
        }

        // Filter by energy type if specified
        if (energyType) {
            const types = (energyType as string).split(',');

            // Filter trending topics
            filteredTrendingTopics = filteredTrendingTopics.filter(topic =>
                types.includes(topic.category)
            );

            // Filter featured experts
            filteredFeaturedExperts = filteredFeaturedExperts.filter(expert => {
                // Check if any of the expert's expertise matches the selected energy types
                return expert.expertise.some(expertise =>
                    types.some(type => expertise.toLowerCase().includes(type.toLowerCase()))
                );
            });

            // Filter recommended content
            filteredRecommendedContent = filteredRecommendedContent.filter(content =>
                types.includes(content.category)
            );
        }

        // Sort content if specified
        if (sortBy) {
            switch (sortBy) {
                case 'recent':
                    filteredTrendingTopics.sort((a, b) => (b.date || 0) - (a.date || 0));
                    filteredRecommendedContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    break;
                case 'popular':
                    filteredTrendingTopics.sort((a, b) => b.views - a.views);
                    filteredRecommendedContent.sort((a, b) => b.views - a.views);
                    break;
                case 'relevant':
                    // In a real implementation, this would use a relevance algorithm
                    // For now, we'll just sort by views
                    filteredTrendingTopics.sort((a, b) => b.views - a.views);
                    filteredRecommendedContent.sort((a, b) => b.views - a.views);
                    break;
                case 'trending':
                default:
                    // Default sort is already by trending
                    break;
            }
        }

        // Return filtered content
        res.json({
            trendingTopics: filteredTrendingTopics,
            featuredExperts: filteredFeaturedExperts,
            recommendedContent: filteredRecommendedContent
        });
    });

    // API endpoint for forum threads (alternative path)
    app.get('/src/api/threads', (req, res) => {
        const { category, sort, page = 1, limit = 10 } = req.query;

        // Build query
        let query = 'SELECT * FROM threads';
        const params: any[] = [];

        // Add category filter if specified
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        // Add sorting
        switch (sort) {
            case 'oldest':
                query += ' ORDER BY created_at ASC';
                break;
            case 'most-comments':
                query += ' ORDER BY comment_count DESC';
                break;
            case 'most-views':
                query += ' ORDER BY view_count DESC';
                break;
            case 'newest':
            default:
                query += ' ORDER BY created_at DESC';
                break;
        }

        // Add pagination
        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit as string), offset);

        pool.query(query, params, (error: any, results: any) => {
            if (error) {
                console.error('Error fetching threads:', error);
                res.status(500).json({ error: 'Failed to fetch threads' });
                return;
            }

            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) as total FROM threads';
            const countParams: any[] = [];

            if (category) {
                countQuery += ' WHERE category = ?';
                countParams.push(category);
            }

            pool.query(countQuery, countParams, (countError, countResults: any) => {
                if (countError) {
                    console.error('Error counting threads:', countError);
                    res.status(500).json({ error: 'Failed to count threads' });
                    return;
                }

                const total = countResults[0].total;
                const pages = Math.ceil(total / parseInt(limit as string));

                res.json({
                    threads: results,
                    pagination: {
                        page: parseInt(page as string),
                        limit: parseInt(limit as string),
                        total,
                        pages
                    }
                });
            });
        });
    });

    // API endpoint for a specific thread (alternative path)
    app.get('/src/api/threads/:id', (req, res) => {
        // Get search query and filters from request
        const { search, contentType, energyType } = req.query;

        // Get base content
        const trendingTopics = getTrendingTopics();
        const featuredExperts = getFeaturedExperts();
        const recommendedContent = getRecommendedContent();
        const personalizedRecommendations = getPersonalizedRecommendations(req);

        // Filter content if search or filters are provided
        let filteredTrendingTopics = trendingTopics;
        let filteredFeaturedExperts = featuredExperts;
        let filteredRecommendedContent = recommendedContent;

        if (search) {
            const searchTerm = (search as string).toLowerCase();

            // Filter trending topics
            filteredTrendingTopics = trendingTopics.filter(topic =>
                topic.title.toLowerCase().includes(searchTerm) ||
                topic.description.toLowerCase().includes(searchTerm)
            );

            // Filter featured experts
            filteredFeaturedExperts = featuredExperts.filter(expert =>
                expert.name.toLowerCase().includes(searchTerm) ||
                expert.bio.toLowerCase().includes(searchTerm)
            );

            // Filter recommended content
            filteredRecommendedContent = recommendedContent.filter(content =>
                content.title.toLowerCase().includes(searchTerm) ||
                content.excerpt.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by content type if specified
        if (contentType) {
            const types = (contentType as string).split(',');

            // Only filter content items if experts is not selected
            if (!types.includes('experts')) {
                filteredFeaturedExperts = [];
            }

            // Only filter trending topics if discussions is not selected
            if (!types.includes('discussions')) {
                filteredTrendingTopics = [];
            }

            // Only filter recommended content if articles/resources are not selected
            if (!types.includes('articles') && !types.includes('resources')) {
                filteredRecommendedContent = [];
            }
        }

        // Filter by energy type if specified
        if (energyType) {
            const types = (energyType as string).split(',');

            // Filter trending topics by energy type
            filteredTrendingTopics = filteredTrendingTopics.filter(topic =>
                types.includes(topic.category)
            );

            // Filter recommended content by energy type
            filteredRecommendedContent = filteredRecommendedContent.filter(content =>
                types.includes(content.category)
            );

            // Filter experts by expertise
            filteredFeaturedExperts = filteredFeaturedExperts.filter(expert => {
                const expertTypes = expert.expertise.join(' ').toLowerCase();
                return types.some(type => expertTypes.includes(type.toLowerCase()));
            });
        }

        // Return filtered content
        res.json({
            trendingTopics: filteredTrendingTopics,
            featuredExperts: filteredFeaturedExperts,
            recommendedContent: filteredRecommendedContent,
            personalizedRecommendations
        });
    });

    // POST endpoint for filtered discovery content
    app.post('/src/api/discovery', (req, res) => {
        const { contentTypes, energyTypes, sortBy } = req.body;

        // In a real implementation, this would filter and sort content from database
        // For now, we'll just return the same content
        res.json({
            trendingTopics: getTrendingTopics(),
            featuredExperts: getFeaturedExperts(),
            recommendedContent: getRecommendedContent()
        });
    });

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Something went wrong!' });
    });

    // Validation error handling middleware
    app.use((req: Request, res: Response, next: NextFunction): void => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
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
export default server;
