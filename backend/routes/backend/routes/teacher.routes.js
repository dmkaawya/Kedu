import express from 'express';
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
} from '../controllers/teacher.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { enforceDataIsolation } from '../middleware/dataIsolation.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const teacherValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('personalInfo.firstName').notEmpty().trim(),
  body('personalInfo.lastName').notEmpty().trim()
];

router.use(authenticate);
router.use(authorize('school_admin'));
router.use(enforceDataIsolation);

router.post('/', teacherValidation, createTeacher);
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

export default router;
