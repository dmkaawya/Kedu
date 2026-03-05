import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentsByClass
} from '../controllers/student.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { enforceDataIsolation } from '../middleware/dataIsolation.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const studentValidation = [
  body('classId').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('personalInfo.firstName').notEmpty().trim(),
  body('personalInfo.lastName').notEmpty().trim()
];

router.use(authenticate);
router.use(enforceDataIsolation);

// School admin and teachers can manage students
router.post('/', authorize('school_admin', 'teacher'), studentValidation, createStudent);
router.get('/', authorize('school_admin', 'teacher', 'student'), getAllStudents);
router.get('/class/:classId', authorize('school_admin', 'teacher'), getStudentsByClass);
router.get('/:id', authorize('school_admin', 'teacher', 'student'), getStudentById);
router.put('/:id', authorize('school_admin'), updateStudent);
router.delete('/:id', authorize('school_admin'), deleteStudent);

export default router;
