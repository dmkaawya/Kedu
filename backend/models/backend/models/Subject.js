import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School',
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique subject code per school
subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });
subjectSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);
