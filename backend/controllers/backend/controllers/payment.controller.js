import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import { validationResult } from 'express-validator';

export const createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, paymentType, amount, paymentDate, dueDate, paymentMethod, transactionId, description } = req.body;
    const { schoolId } = req.user;

    // Verify student belongs to school
    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      isActive: true
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate receipt number
    const receiptNumber = `RCP-${schoolId}-${Date.now()}`;

    const payment = await Payment.create({
      schoolId,
      studentId,
      paymentType,
      amount,
      paymentDate: paymentDate || new Date(),
      dueDate,
      paymentMethod,
      transactionId,
      description,
      receiptNumber,
      status: paymentMethod ? 'paid' : 'pending',
      recordedBy: req.user._id
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('studentId', 'studentId personalInfo')
      .populate('recordedBy', 'profile');

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: populatedPayment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId, status, paymentType, startDate, endDate } = req.query;

    let query = { schoolId };

    if (studentId) query.studentId = studentId;
    if (status) query.status = status;
    if (paymentType) query.paymentType = paymentType;
    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .populate('studentId', 'studentId personalInfo classId')
      .populate('recordedBy', 'profile')
      .sort({ paymentDate: -1 });

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      payments,
      totals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const payment = await Payment.findOne({
      _id: req.params.id,
      schoolId
    })
      .populate('studentId', 'studentId personalInfo classId')
      .populate('recordedBy', 'profile');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Students can only view their own payments
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id, schoolId });
      if (!student || student._id.toString() !== payment.studentId._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.schoolId;
    delete updates.studentId;
    delete updates.receiptNumber;

    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      updates,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'studentId personalInfo')
      .populate('recordedBy', 'profile');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentPayments = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;

    // Verify student belongs to school
    const student = await Student.findOne({
      _id: studentId,
      schoolId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Students can only view their own payments
    if (req.user.role === 'student') {
      const studentUser = await Student.findOne({ userId: req.user._id, schoolId });
      if (!studentUser || studentUser._id.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const payments = await Payment.find({
      schoolId,
      studentId
    })
      .populate('recordedBy', 'profile')
      .sort({ paymentDate: -1 });

    // Calculate summary
    const summary = await Payment.aggregate([
      {
        $match: { schoolId, studentId }
      },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalPaid = summary.find(s => s._id === 'paid')?.total || 0;
    const totalPending = summary.find(s => s._id === 'pending')?.total || 0;
    const totalOverdue = summary.find(s => s._id === 'overdue')?.total || 0;

    res.json({
      payments,
      summary: {
        totalPaid,
        totalPending,
        totalOverdue,
        balance: totalPending + totalOverdue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
