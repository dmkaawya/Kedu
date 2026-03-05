import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School',
    index: true
  },
  teacherId: {
    type: String,
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
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  employmentInfo: {
    employeeId: String,
    hireDate: {
      type: Date,
      default: Date.now
    },
    department: String,
    subjects: [String],
    qualification: String
  },
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique teacher ID per school
teacherSchema.index({ schoolId: 1, teacherId: 1 }, { unique: true });

export default mongoose.model('Teacher', teacherSchema);
