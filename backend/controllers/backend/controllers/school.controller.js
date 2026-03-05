import School from '../models/School.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { generateToken } from '../utils/generateToken.js';

export const registerSchool = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, address, adminEmail, adminPassword, adminProfile } = req.body;

    // Check if school email exists
    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      return res.status(400).json({ message: 'School already registered with this email' });
    }

    // Check if admin email exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin email already in use' });
    }

    // Create school (schoolId will be auto-generated)
    const school = await School.create({
      name,
      email,
      phone,
      address
    });

    // Create school admin user
    const adminUser = await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'school_admin',
      schoolId: school.schoolId,
      profile: adminProfile || {
        firstName: 'Admin',
        lastName: school.name
      }
    });

    const token = generateToken(adminUser._id);

    res.status(201).json({
      message: 'School registered successfully',
      school: {
        schoolId: school.schoolId,
        name: school.name,
        email: school.email,
        isActive: school.isActive
      },
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      },
      token
    });
  } catch (error) {
    console.error('School registration error:', error);
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'email' ? 'School email' : field} already exists` 
      });
    }
    res.status(500).json({ 
      message: error.message || 'School registration failed. Please check all fields and try again.' 
    });
  }
};

export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 });
    res.json({ schools });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchoolById = async (req, res) => {
  try {
    const school = await School.findOne({ schoolId: req.params.schoolId });
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json({ school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSchoolStatus = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { isActive } = req.body;

    const school = await School.findOneAndUpdate(
      { schoolId },
      { isActive },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json({
      message: `School ${isActive ? 'activated' : 'deactivated'} successfully`,
      school
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const updates = req.body;

    const school = await School.findOneAndUpdate(
      { schoolId },
      updates,
      { new: true, runValidators: true }
    );

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    res.json({ message: 'School updated successfully', school });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
