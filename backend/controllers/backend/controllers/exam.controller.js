import ExamResult from '../models/ExamResult.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import { validationResult } from 'express-validator';

export const createExamResult = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, classId, subjectId, examType, examName, marksObtained, totalMarks, examDate, remarks } = req.body;
    const { schoolId } = req.user;

    // Verify student belongs to class and school
    const student = await Student.findOne({
      _id: studentId,
      classId,
      schoolId,
      isActive: true
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found in this class' });
    }

    // Verify subject assignment for teachers
    if (req.user.role === 'teacher') {
      const subject = await Subject.findOne({ _id: subjectId, schoolId, teachers: req.user._id });
      if (!subject) {
        return res.status(403).json({ message: 'Access denied. You can only enter results for your assigned subjects.' });
      }
    }

    const examResult = await ExamResult.create({
      schoolId,
      studentId,
      classId,
      subjectId,
      examType,
      examName,
      marksObtained,
      totalMarks,
      examDate: examDate || new Date(),
      remarks,
      enteredBy: req.user._id,
      isPublished: false // Always starts unpublished
    });

    const populatedResult = await ExamResult.findById(examResult._id)
      .populate('studentId', 'studentId personalInfo')
      .populate('classId', 'name grade section')
      .populate('subjectId', 'name code')
      .populate('enteredBy', 'profile');

    res.status(201).json({
      message: 'Exam result recorded successfully',
      result: populatedResult
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllExamResults = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId, classId, subjectId, examType, isPublished, startDate, endDate } = req.query;

    let query = { schoolId };

    if (studentId) query.studentId = studentId;
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (examType) query.examType = examType;
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }

    // ROLE BASED FILTERING
    if (req.user.role === 'teacher') {
      // Teachers see results they entered
      query.enteredBy = req.user._id;
    } else if (req.user.role === 'student') {
      // Students only see published marks
      query.isPublished = true;
      const studentUser = await Student.findOne({ userId: req.user._id, schoolId });
      if (!studentUser) return res.status(404).json({ message: 'Student record not found' });
      query.studentId = studentUser._id;
    }

    if (startDate && endDate) {
      query.examDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const results = await ExamResult.find(query)
      .populate('studentId', 'studentId personalInfo')
      .populate('classId', 'name grade section')
      .populate('subjectId', 'name code')
      .populate('enteredBy', 'profile')
      .sort({ examDate: -1 });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamResultById = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const result = await ExamResult.findOne({
      _id: req.params.id,
      schoolId
    })
      .populate('studentId', 'studentId personalInfo classId')
      .populate('classId', 'name grade section')
      .populate('subjectId', 'name code')
      .populate('enteredBy', 'profile');

    if (!result) {
      return res.status(404).json({ message: 'Exam result not found' });
    }

    // Role-based visibility check
    if (req.user.role === 'student') {
      if (!result.isPublished) {
        return res.status(403).json({ message: 'Result not yet published' });
      }
      const student = await Student.findOne({ userId: req.user._id, schoolId });
      if (!student || student._id.toString() !== result.studentId._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'teacher') {
      // Teacher can only see their own entries or if they are assigned to the subject
      if (result.enteredBy.toString() !== req.user._id.toString()) {
        const isAssigned = await Subject.exists({ _id: result.subjectId, teachers: req.user._id });
        if (!isAssigned) return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExamResult = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.schoolId;
    delete updates.studentId;
    delete updates.classId;
    delete updates.isPublished;

    const query = { _id: req.params.id, schoolId };
    
    // Teachers can only update their own results
    if (req.user.role === 'teacher') {
      query.enteredBy = req.user._id;
    }

    const result = await ExamResult.findOneAndUpdate(
      query,
      updates,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'studentId personalInfo')
      .populate('classId', 'name grade section')
      .populate('subjectId', 'name code')
      .populate('enteredBy', 'profile');

    if (!result) {
      return res.status(404).json({ message: 'Exam result not found or access denied' });
    }

    res.json({
      message: 'Exam result updated successfully',
      result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExamResult = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const query = { _id: req.params.id, schoolId };

    if (req.user.role === 'teacher') {
       query.enteredBy = req.user._id;
    }

    const result = await ExamResult.findOneAndDelete(query);

    if (!result) {
      return res.status(404).json({ message: 'Exam result not found or access denied' });
    }

    res.json({ message: 'Exam result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishResults = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId, subjectId, examType } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }

    let query = { schoolId, classId };
    if (subjectId) query.subjectId = subjectId;
    if (examType) query.examType = examType;

    const result = await ExamResult.updateMany(
      query,
      { $set: { isPublished: true } }
    );

    res.json({
      message: `Successfully published ${result.modifiedCount} results`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;
    const { subjectId, examType } = req.query;

    let query = { schoolId, studentId, isPublished: true };
    if (subjectId) query.subjectId = subjectId;
    if (examType) query.examType = examType;

    if (req.user.role === 'student') {
      const studentUser = await Student.findOne({ userId: req.user._id, schoolId });
      if (!studentUser || studentUser._id.toString() !== studentId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const results = await ExamResult.find(query)
      .populate('classId', 'name grade section')
      .populate('subjectId', 'name code')
      .populate('enteredBy', 'profile')
      .sort({ examDate: -1 });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClassResults = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId } = req.params;
    const { subjectId, examType } = req.query;

    const classData = await Class.findOne({ _id: classId, schoolId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    let query = { schoolId, classId };
    if (subjectId) query.subjectId = subjectId;
    if (examType) query.examType = examType;

    // Filter by role for teachers if they should only see their own subjects' results
    if (req.user.role === 'teacher' && subjectId) {
       const isAssigned = await Subject.exists({ _id: subjectId, teachers: req.user._id });
       if (!isAssigned) return res.status(403).json({ message: 'Access denied' });
    }

    const results = await ExamResult.find(query)
      .populate('studentId', 'studentId personalInfo')
      .populate('subjectId', 'name code')
      .populate('enteredBy', 'profile')
      .sort({ 'studentId.personalInfo.lastName': 1, examDate: -1 });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
