import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['super_admin', 'school_admin', 'teacher', 'student'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

export default router;
