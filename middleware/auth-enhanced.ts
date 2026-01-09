import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Define user interface
interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
}

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
    user?: User;
}

// Middleware to check if user is authenticated
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'] as string;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ error: 'Authentication token required' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
        if (err) {
            res.status(403).json({ error: 'Token is not valid' });
            return;
        }
        req.user = user as User;
        next();
    });
};

// Middleware to check if user has specific role
const authorizeRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (req.user.role && roles.includes(req.user.role!)) {
            next();
        } else {
            res.status(403).json({ error: 'Insufficient permissions' });
        }
    };
};

// Middleware to validate input
const validateInput = (validations: ValidationChain[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Run all validations
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }

        next();
    };
};

// Validation rules for common inputs
const validationRules = {
    login: [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],

    register: [
        body('username')
            .isLength({ min: 3, max: 20 })
            .withMessage('Username must be between 3 and 20 characters')
            .matches(/^[a-zA-Z0-9]+$/)
            .withMessage('Username can only contain letters and numbers'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password!) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
    ],

    forumPost: [
        body('title')
            .isLength({ min: 5, max: 100 })
            .withMessage('Title must be between 5 and 100 characters'),
        body('content')
            .isLength({ min: 10 })
            .withMessage('Content must be at least 10 characters'),
        body('category')
            .isIn(['hydrogen', 'solar', 'wind', 'biofuels', 'geothermal', 'nuclear'])
            .withMessage('Please select a valid category')
    ]
};

// Password hashing utility
const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Password comparison utility
const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

// Token generation utility
const generateToken = (user: User): string => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
    );
};

// Session management utility
const refreshToken = (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
        const token = generateToken(req.user);
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

export {
    authenticateToken,
    authorizeRole,
    validateInput,
    validationRules,
    hashPassword,
    comparePassword,
    generateToken,
    refreshToken
};
