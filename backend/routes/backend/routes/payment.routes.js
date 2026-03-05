import express from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  getStudentPayments
} from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { enforceDataIsolation } from '../middleware/dataIsolation.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

const paymentValidation = [
  body('studentId').notEmpty(),
  body('paymentType').isIn(['tuition', 'fee', 'exam', 'library', 'sports', 'other']),
  body('amount').isFloat({ min: 0 })
];

router.use(authenticate);
router.use(enforceDataIsolation);

router.post('/', authorize('school_admin'), paymentValidation, createPayment);
router.get('/', authorize('school_admin', 'student'), getAllPayments);
router.get('/student/:studentId', authorize('school_admin', 'student'), getStudentPayments);
router.get('/:id', authorize('school_admin', 'student'), getPaymentById);
router.put('/:id', authorize('school_admin'), updatePayment);

export default router;
