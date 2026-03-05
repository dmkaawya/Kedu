import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School',
    index: true
  },
  studentId: {
    type: String,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    bloodGroup: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  parentInfo: {
    fatherName: String,
    motherName: String,
    guardianName: String,
    parentPhone: String,
    parentEmail: String
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique student ID per school
studentSchema.index({ schoolId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);
