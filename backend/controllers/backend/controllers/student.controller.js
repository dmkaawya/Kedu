import Student from '../models/Student.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import { generateStudentId } from '../utils/generateId.js';
import { validationResult } from 'express-validator';

export const createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, email, password, personalInfo, parentInfo } = req.body;
    const { schoolId } = req.user;

    // Verify class exists and belongs to school
    const classData = await Class.findOne({ _id: classId, schoolId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Generate student ID
    const studentId = generateStudentId(schoolId);

    // Create user account
    const user = await User.create({
      email,
      password,
      role: 'student',
      schoolId,
      profile: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone || parentInfo?.parentPhone
      }
    });

    // Create student record
    const student = await Student.create({
      schoolId,
      studentId,
      classId,
      userId: user._id,
      personalInfo,
      parentInfo
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('classId', 'name grade section')
      .populate('userId', 'email profile');

    res.status(201).json({
      message: 'Student created successfully',
      student: populatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId, isActive } = req.query;

    const query = { schoolId };
    if (classId) query.classId = classId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const students = await Student.find(query)
      .populate('classId', 'name grade section')
      .populate('userId', 'email profile')
      .sort({ 'personalInfo.lastName': 1, 'personalInfo.firstName': 1 });

    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { role } = req.user;

    const student = await Student.findOne({
      _id: req.params.id,
      schoolId
    })
      .populate('classId', 'name grade section academicYear')
      .populate('userId', 'email profile');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Students can only view their own data
    if (role === 'student') {
      const studentUser = await Student.findOne({ userId: req.user._id, schoolId });
      if (!studentUser || studentUser._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.studentId;
    delete updates.schoolId;
    delete updates.userId;

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      updates,
      { new: true, runValidators: true }
    )
      .populate('classId', 'name grade section')
      .populate('userId', 'email profile');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const student = await Student.findOne({ _id: req.params.id, schoolId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete - mark as inactive
    student.isActive = false;
    await student.save();

    // Also deactivate user account
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentsByClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId } = req.params;

    // Verify class belongs to school
    const classData = await Class.findOne({ _id: classId, schoolId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const students = await Student.find({
      classId,
      schoolId,
      isActive: true
    })
      .populate('userId', 'email profile')
      .sort({ 'personalInfo.lastName': 1, 'personalInfo.firstName': 1 });

    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
