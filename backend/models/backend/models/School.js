import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique School ID before saving
schoolSchema.pre('save', async function(next) {
  if (!this.schoolId) {
    let unique = false;
    while (!unique) {
      const randomId = 'SCH' + Date.now().toString().slice(-8) + Math.random().toString(36).substring(2, 5).toUpperCase();
      const existing = await mongoose.model('School').findOne({ schoolId: randomId });
      if (!existing) {
        this.schoolId = randomId;
        unique = true;
      }
    }
  }
  next();
});

export default mongoose.model('School', schoolSchema);
