import express from 'express';
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass
} from '../controllers/class.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { enforceDataIsolation } from '../middleware/dataIsolation.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const classValidation = [
  body('name').notEmpty().trim(),
  body('grade').notEmpty().trim()
];

// All routes require authentication and school admin/teacher access
router.use(authenticate);
router.use(authorize('school_admin', 'teacher'));
router.use(enforceDataIsolation);

router.post('/', classValidation, createClass);
router.get('/', getAllClasses);
router.get('/:id', getClassById);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;
