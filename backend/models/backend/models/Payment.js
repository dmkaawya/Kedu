import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School',
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  paymentType: {
    type: String,
    enum: ['tuition', 'fee', 'exam', 'library', 'sports', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: Date,
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'card', 'online', 'other']
  },
  transactionId: String,
  description: String,
  receiptNumber: String,
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
paymentSchema.index({ schoolId: 1, studentId: 1, paymentDate: -1 });
paymentSchema.index({ schoolId: 1, status: 1 });

export default mongoose.model('Payment', paymentSchema);
