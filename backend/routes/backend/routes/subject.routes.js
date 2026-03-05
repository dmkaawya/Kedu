import express from 'express';
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} from '../controllers/subject.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const subjectValidation = [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim()
];

// All subject routes require school admin or super admin privileges
router.use(authenticate);

router.post('/', authorize('school_admin', 'super_admin'), subjectValidation, createSubject);
router.get('/', authorize('school_admin', 'super_admin', 'teacher'), getSubjects);
router.get('/:id', authorize('school_admin', 'super_admin', 'teacher'), getSubjectById);
router.put('/:id', authorize('school_admin', 'super_admin'), updateSubject);
router.delete('/:id', authorize('school_admin', 'super_admin'), deleteSubject);

export default router;
