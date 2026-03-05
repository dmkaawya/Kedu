import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    ref: 'School',
    index: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
    default: 'absent'
  },
  remarks: String,
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
attendanceSchema.index({ schoolId: 1, classId: 1, subjectId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, studentId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, classId: 1, subjectId: 1, studentId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
