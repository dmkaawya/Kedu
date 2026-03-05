import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
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
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project', 'other'],
    required: true
  },
  examName: {
    type: String,
    required: true,
    trim: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
  },
  examDate: {
    type: Date,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  remarks: String,
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate percentage before saving
examResultSchema.pre('save', function(next) {
  if (this.marksObtained !== undefined && this.totalMarks !== undefined) {
    this.percentage = (this.marksObtained / this.totalMarks) * 100;
    
    // Assign grade based on percentage
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B+';
    else if (this.percentage >= 60) this.grade = 'B';
    else if (this.percentage >= 50) this.grade = 'C+';
    else if (this.percentage >= 40) this.grade = 'C';
    else if (this.percentage >= 33) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

// Compound index for efficient queries
examResultSchema.index({ schoolId: 1, studentId: 1, examDate: -1 });
examResultSchema.index({ schoolId: 1, classId: 1, subjectId: 1 });

export default mongoose.model('ExamResult', examResultSchema);
