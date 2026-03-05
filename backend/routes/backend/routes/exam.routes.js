import express from 'express';
import {
  createExamResult,
  getAllExamResults,
  getExamResultById,
  updateExamResult,
  deleteExamResult,
  getStudentResults,
  getClassResults,
  publishResults
} from '../controllers/exam.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { enforceDataIsolation } from '../middleware/dataIsolation.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const examResultValidation = [
  body('studentId').notEmpty(),
  body('classId').notEmpty(),
  body('subjectId').notEmpty(),
  body('examType').isIn(['quiz', 'midterm', 'final', 'assignment', 'project', 'other']),
  body('examName').notEmpty().trim(),
  body('marksObtained').isFloat({ min: 0 }),
  body('totalMarks').isFloat({ min: 1 })
];

router.use(authenticate);
router.use(enforceDataIsolation);

router.post('/', authorize('school_admin', 'teacher'), examResultValidation, createExamResult);
router.post('/publish', authorize('school_admin'), [body('classId').notEmpty()], publishResults);
router.get('/', authorize('school_admin', 'teacher', 'student'), getAllExamResults);
router.get('/student/:studentId', authorize('school_admin', 'teacher', 'student'), getStudentResults);
router.get('/class/:classId', authorize('school_admin', 'teacher'), getClassResults);
router.get('/:id', authorize('school_admin', 'teacher', 'student'), getExamResultById);
router.put('/:id', authorize('school_admin', 'teacher'), updateExamResult);
router.delete('/:id', authorize('school_admin'), deleteExamResult);

export default router;
