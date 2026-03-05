import Class from '../models/Class.js';
import Student from '../models/Student.js';
import { validationResult } from 'express-validator';

export const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, grade, section, academicYear, capacity, classTeacher, subjects } = req.body;
    const { schoolId } = req.user;

    // Check if class already exists
    const existingClass = await Class.findOne({
      schoolId,
      name,
      academicYear: academicYear || new Date().getFullYear().toString()
    });

    if (existingClass) {
      return res.status(400).json({ message: 'Class already exists for this academic year' });
    }

    const newClass = await Class.create({
      schoolId,
      name,
      grade,
      section,
      academicYear: academicYear || new Date().getFullYear().toString(),
      capacity: capacity || 50,
      classTeacher,
      subjects
    });

    const populatedClass = await Class.findById(newClass._id)
      .populate('classTeacher', 'profile email')
      .populate('subjects', 'name code');

    res.status(201).json({
      message: 'Class created successfully',
      class: populatedClass
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { academicYear } = req.query;

    const query = { schoolId };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const classes = await Class.find(query)
      .populate('classTeacher', 'profile email')
      .populate('subjects', 'name code')
      .sort({ grade: 1, name: 1 });

    // Get student count for each class
    const classesWithCounts = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({
          classId: cls._id,
          isActive: true
        });
        return {
          ...cls.toObject(),
          studentCount
        };
      })
    );

    res.json({ classes: classesWithCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const classData = await Class.findOne({
      _id: req.params.id,
      schoolId
    })
    .populate('classTeacher', 'profile email')
    .populate('subjects', 'name code');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentCount = await Student.countDocuments({
      classId: classData._id,
      isActive: true
    });

    res.json({
      class: {
        ...classData.toObject(),
        studentCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const updates = req.body;

    const classData = await Class.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      updates,
      { new: true, runValidators: true }
    )
    .populate('classTeacher', 'profile email')
    .populate('subjects', 'name code');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({
      message: 'Class updated successfully',
      class: classData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { schoolId } = req.user;

    // Check if class has students
    const studentCount = await Student.countDocuments({
      classId: req.params.id,
      isActive: true
    });

    if (studentCount > 0) {
      return res.status(400).json({
        message: `Cannot delete class. ${studentCount} student(s) are enrolled.`
      });
    }

    const classData = await Class.findOneAndDelete({
      _id: req.params.id,
      schoolId
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
