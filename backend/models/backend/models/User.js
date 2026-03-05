import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },
  username: {
    type: String,
    unique: true,
    trim: true,
    sparse: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['super_admin', 'school_admin', 'teacher', 'student'],
    required: true
  },
  schoolId: {
    type: String,
    ref: 'School',
    index: true
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
