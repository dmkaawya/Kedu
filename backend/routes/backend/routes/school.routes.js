import express from 'express';
import {
  registerSchool,
  getAllSchools,
  getSchoolById,
  updateSchoolStatus,
  updateSchool
} from '../controllers/school.controller.js';
import { authenticate, authorize, requireSchoolAccess } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const schoolRegistrationValidation = [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('adminEmail').isEmail().normalizeEmail(),
  body('adminPassword').isLength({ min: 6 })
];

// Public route - school registration
router.post('/register', schoolRegistrationValidation, registerSchool);

// Super admin only routes
router.get('/', authenticate, authorize('super_admin'), getAllSchools);
router.get('/:schoolId', authenticate, authorize('super_admin'), getSchoolById);
router.patch('/:schoolId/status', authenticate, authorize('super_admin'), updateSchoolStatus);
router.put('/:schoolId', authenticate, authorize('super_admin'), updateSchool);

export default router;
