import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 50
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique class name per school and academic year
classSchema.index({ schoolId: 1, name: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);
