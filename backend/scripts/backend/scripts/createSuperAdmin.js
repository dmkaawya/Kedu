import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management');
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2] || 'admin@platform.com';
    const password = process.argv[3] || 'admin123';

    // Check if super admin already exists
    const existing = await User.findOne({ email, role: 'super_admin' });
    if (existing) {
      console.log('❌ Super admin already exists with this email');
      process.exit(1);
    }

    // Create super admin
    const superAdmin = await User.create({
      email,
      password,
      role: 'super_admin',
      profile: {
        firstName: 'Super',
        lastName: 'Admin'
      }
    });

    console.log('✅ Super admin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`User ID: ${superAdmin._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
