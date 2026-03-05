import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import { generateTeacherId } from '../utils/generateId.js';
import { validationResult } from 'express-validator';

export const createTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, personalInfo, employmentInfo, assignedClasses } = req.body;
    const { schoolId } = req.user;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Generate teacher ID
    const teacherId = generateTeacherId(schoolId);

    // Create user account
    const user = await User.create({
      email,
      password,
      role: 'teacher',
      schoolId,
      profile: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone
      }
    });

    // Verify assigned classes belong to school
    if (assignedClasses && assignedClasses.length > 0) {
      const classes = await Class.find({
        _id: { $in: assignedClasses },
        schoolId
      });
      if (classes.length !== assignedClasses.length) {
        return res.status(400).json({ message: 'One or more classes not found' });
      }
    }

    // Create teacher record
    const teacher = await Teacher.create({
      schoolId,
      teacherId,
      userId: user._id,
      personalInfo, // Keep detailed info in teacher record
      employmentInfo,
      assignedClasses: assignedClasses || []
    });

    // Update classes with teacher assignment
    if (assignedClasses && assignedClasses.length > 0) {
      await Class.updateMany(
        { _id: { $in: assignedClasses } },
        { $set: { classTeacher: user._id } } // Use user._id for Class.classTeacher
      );
    }

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedClasses', 'name grade section')
      .populate('userId', 'email profile');

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: populatedTeacher
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { isActive } = req.query;

    const query = { schoolId };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const teachers = await Teacher.find(query)
      .populate('assignedClasses', 'name grade section')
      .populate('userId', 'email profile')
      .sort({ 'personalInfo.lastName': 1, 'personalInfo.firstName': 1 });

    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      schoolId
    })
      .populate('assignedClasses', 'name grade section academicYear')
      .populate('userId', 'email profile');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.teacherId;
    delete updates.schoolId;
    delete updates.userId;

    const teacher = await Teacher.findOne({ _id: req.params.id, schoolId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Handle class assignments
    if (updates.assignedClasses) {
      const classes = await Class.find({
        _id: { $in: updates.assignedClasses },
        schoolId
      });
      if (classes.length !== updates.assignedClasses.length) {
        return res.status(400).json({ message: 'One or more classes not found' });
      }

      // Remove teacher from old classes
      await Class.updateMany(
        { classTeacher: teacher.userId },
        { $unset: { classTeacher: '' } }
      );
      // Assign to new classes
      await Class.updateMany(
        { _id: { $in: updates.assignedClasses } },
        { $set: { classTeacher: teacher.userId } }
      );
    }

    const updatedTeacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedClasses', 'name grade section')
      .populate('userId', 'email profile');

    res.json({
      message: 'Teacher updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const teacher = await Teacher.findOne({ _id: req.params.id, schoolId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Soft delete - mark as inactive
    teacher.isActive = false;
    await teacher.save();

    // Remove from classes
    await Class.updateMany(
      { classTeacher: teacher.userId },
      { $unset: { classTeacher: '' } }
    );

    // Deactivate user account
    await User.findByIdAndUpdate(teacher.userId, { isActive: false });

    res.json({ message: 'Teacher deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
