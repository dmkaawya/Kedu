import express from 'express';
import {
  markAttendance,
  getAttendanceByClass,
  getAttendanceByStudent,
  getAttendanceReport
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { enforceDataIsolation } from '../middleware/dataIsolation.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const attendanceValidation = [
  body('classId').notEmpty(),
  body('attendanceRecords').isArray().notEmpty(),
  body('attendanceRecords.*.studentId').notEmpty(),
  body('attendanceRecords.*.status').isIn(['present', 'absent', 'late', 'excused'])
];

router.use(authenticate);
router.use(enforceDataIsolation);

router.post('/', authorize('school_admin', 'teacher'), attendanceValidation, markAttendance);
router.get('/class/:classId', authorize('school_admin', 'teacher'), getAttendanceByClass);
router.get('/student/:studentId', authorize('school_admin', 'teacher', 'student'), getAttendanceByStudent);
router.get('/report', authorize('school_admin', 'teacher'), getAttendanceReport);

export default router;
