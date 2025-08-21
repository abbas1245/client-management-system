import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../../config/env';
import User from '../models/User';

const router = Router();

const signToken = (userId: string, email: string, role: string) =>
  jwt.sign({ userId, email, role }, config.JWT_SECRET, { expiresIn: '7d' });

router.post(
  '/signup',
  [
    body('name').optional().isString().isLength({ min: 2, max: 100 }),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
  ],
  async (req: Request, res: Response) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      
    const { name, email, password } = req.body as { name?: string; email: string; password: string };
    const exists = await User.findOne({ email }).exec();
    if (exists) return res.status(400).json({ error: 'User with this email already exists' });
      
    const passwordHash = await bcrypt.hash(password, 10);
      // Explicitly set role to 'user' to avoid validation errors
      const user = await User.create({ name, email, passwordHash, role: 'user' });
    const token = signToken(user.id, user.email, user.role);
      
      return res.status(201).json({ 
        message: 'User created successfully', 
        user: { id: user.id, email: user.email, role: user.role, name: user.name }, 
        token 
      });
    } catch (error) {
      console.error('[auth_signup] Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user account' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isString().isLength({ min: 1 }).withMessage('Password required'),
  ],
  async (req: Request, res: Response) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[auth_login] Validation errors:', errors.array());
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password } = req.body as { email: string; password: string };
      console.log('[auth_login] Attempting login for email:', email);
      
    // Select legacy 'password' (from old JS model) and new 'passwordHash'
    const user = await User.findOne({ email }).select('+password +passwordHash').exec();
      console.log('[auth_login] User found:', user ? 'Yes' : 'No');
      
    if (!user) {
        console.log('[auth_login] No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

      console.log('[auth_login] User ID:', user.id);
      console.log('[auth_login] User role:', user.role);
      console.log('[auth_login] Has passwordHash:', !!(user as any).passwordHash);
      console.log('[auth_login] Has password:', !!(user as any).password);

    const candidateHash = (user as any).passwordHash || (user as any).password;
    if (!candidateHash) {
        console.log('[auth_login] No password hash found for user');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
      
    const ok = await bcrypt.compare(password, candidateHash);
      console.log('[auth_login] Password comparison result:', ok);
      
    if (!ok) {
        console.log('[auth_login] Password comparison failed');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user.id, user.email, user.role);
      console.log('[auth_login] Login successful, token generated');
      
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
      console.error('[auth_login] Error during login:', error);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  }
);

// Utility endpoint to fix existing users with invalid roles (development only)
router.post('/fix-user-roles', async (req: Request, res: Response) => {
  if (config.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }
  
  try {
    console.log('[fix_roles] Starting role fix process...');
    
    // Find all users with invalid roles
    const invalidUsers = await User.find({
      role: { $nin: ['admin', 'manager', 'rep', 'user'] }
    });
    
    console.log('[fix_roles] Found users with invalid roles:', invalidUsers.length);
    
    if (invalidUsers.length === 0) {
      return res.json({ message: 'No users with invalid roles found' });
    }
    
    // Fix each user's role
    const fixedUsers = [];
    for (const user of invalidUsers) {
      const oldRole = user.role;
      user.role = 'user'; // Set to default role
      await user.save();
      fixedUsers.push({ id: user.id, email: user.email, oldRole, newRole: user.role });
      console.log(`[fix_roles] Fixed user ${user.email}: ${oldRole} → ${user.role}`);
    }
    
    return res.json({ 
      message: `Fixed ${fixedUsers.length} users with invalid roles`,
      fixedUsers 
    });
    
  } catch (error) {
    console.error('[fix_roles] Error fixing user roles:', error);
    return res.status(500).json({ error: 'Failed to fix user roles' });
  }
});

// Test endpoint to check user existence
router.get('/test-user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    console.log('[auth_test] Checking user existence for email:', email);
    
    const user = await User.findOne({ email }).select('+password +passwordHash').exec();
    
    if (!user) {
      return res.json({ 
        exists: false, 
        message: 'No user found with this email',
        email: email
      });
    }
    
    return res.json({ 
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        hasPasswordHash: !!(user as any).passwordHash,
        hasPassword: !!(user as any).password,
        createdAt: user.createdAt
      },
      message: 'User found'
    });
    
  } catch (error) {
    console.error('[auth_test] Error checking user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Dev-only registration route
router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').optional().isString(),
    body('role').optional().isIn(['admin', 'manager', 'rep', 'user']),
  ],
  async (req: Request, res: Response) => {
    if (config.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Registration disabled' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { email, password, name, role = 'user' } = req.body as { email: string; password: string; name?: string; role?: string };

    const exists = await User.findOne({ email }).exec();
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role });
    const token = signToken(user.id, user.email, user.role);
    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  }
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email required')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    const { email } = req.body as { email: string };
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires').exec();
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent' });
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // In production send email. For dev, return token.
    return res.json({ message: 'Password reset token generated', token });
  }
);

router.post(
  '/reset-password',
  [
    body('token').isString().isLength({ min: 10 }),
    body('password').isString().isLength({ min: 6 }),
    body('confirmPassword').custom((v, { req }) => v === req.body.password).withMessage('Passwords do not match'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    const { token, password } = req.body as { token: string; password: string };
    const hashed = require('crypto').createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: new Date() } }).select('+passwordHash +passwordResetToken +passwordResetExpires').exec();
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });
    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.json({ message: 'Password has been reset successfully' });
  }
);

router.get('/profile', async (req: Request, res: Response) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Access token required' });
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password -passwordHash -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (e: any) {
    if (e?.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;


