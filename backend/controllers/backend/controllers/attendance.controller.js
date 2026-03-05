import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import { validationResult } from 'express-validator';

export const markAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, subjectId, date, attendanceRecords } = req.body;
    const { schoolId } = req.user;

    // Verify class belongs to school
    const classData = await Class.findOne({ _id: classId, schoolId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Verify subject exists and is linked to the class (or if user is school_admin)
    const subject = await Subject.findOne({ _id: subjectId, schoolId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Teacher specific check: must be assigned to this subject
    if (req.user.role === 'teacher') {
      const isAssigned = subject.teachers.some(t => t.toString() === req.user._id.toString());
      if (!isAssigned) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to this subject.' });
      }
    }

    // Process attendance records
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];

    for (const record of attendanceRecords) {
      const { studentId, status, remarks } = record;

      // Verify student belongs to class and school
      const student = await Student.findOne({
        _id: studentId,
        classId,
        schoolId,
        isActive: true
      });

      if (!student) {
        results.push({
          studentId,
          success: false,
          message: 'Student not found in this class'
        });
        continue;
      }

      // Check if attendance already exists for this date and subject
      const existing = await Attendance.findOne({
        schoolId,
        classId,
        subjectId,
        studentId,
        date: attendanceDate
      });

      if (existing) {
        // Update existing attendance
        existing.status = status;
        existing.remarks = remarks;
        existing.markedBy = req.user._id;
        await existing.save();
        results.push({
          studentId,
          success: true,
          message: 'Attendance updated',
          attendance: existing
        });
      } else {
        // Create new attendance
        const attendance = await Attendance.create({
          schoolId,
          classId,
          subjectId,
          studentId,
          date: attendanceDate,
          status,
          remarks,
          markedBy: req.user._id
        });
        results.push({
          studentId,
          success: true,
          message: 'Attendance marked',
          attendance
        });
      }
    }

    res.status(201).json({
      message: 'Attendance marked successfully',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceByClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId } = req.params;
    const { subjectId, date, startDate, endDate } = req.query;

    if (!subjectId) {
      return res.status(400).json({ message: 'subjectId is required' });
    }

    // Verify class belongs to school
    const classData = await Class.findOne({ _id: classId, schoolId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    let query = { schoolId, classId, subjectId };

    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);
      query.date = attendanceDate;
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'studentId personalInfo')
      .populate('subjectId', 'name code')
      .populate('markedBy', 'profile')
      .sort({ date: -1, 'studentId.personalInfo.lastName': 1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId } = req.params;
    const { subjectId, startDate, endDate } = req.query;

    // Verify student belongs to school
    const student = await Student.findOne({
      _id: studentId,
      schoolId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Students can only view their own attendance
    if (req.user.role === 'student') {
      const studentUser = await Student.findOne({ userId: req.user._id, schoolId });
      if (!studentUser || studentUser._id.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    let query = { schoolId, studentId };
    if (subjectId) query.subjectId = subjectId;

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .populate('classId', 'name grade section')
      .populate('subjectId', 'name code')
      .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    res.json({
      attendance,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId, subjectId, startDate, endDate } = req.query;

    if (!classId || !subjectId || !startDate || !endDate) {
      return res.status(400).json({ message: 'classId, subjectId, startDate, and endDate are required' });
    }

    // Verify class belongs to school
    const classData = await Class.findOne({ _id: classId, schoolId });
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get all students in class
    const students = await Student.find({
      classId,
      schoolId,
      isActive: true
    }).select('studentId personalInfo');

    // Get attendance for each student
    const report = await Promise.all(
      students.map(async (student) => {
        const attendance = await Attendance.find({
          schoolId,
          classId,
          subjectId,
          studentId: student._id,
          date: { $gte: start, $lte: end }
        });

        const stats = {
          total: attendance.length,
          present: attendance.filter(a => a.status === 'present').length,
          absent: attendance.filter(a => a.status === 'absent').length,
          late: attendance.filter(a => a.status === 'late').length,
          excused: attendance.filter(a => a.status === 'excused').length
        };

        return {
          student: {
            id: student._id,
            studentId: student.studentId,
            name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`
          },
          statistics: stats,
          attendancePercentage: stats.total > 0 ? ((stats.present + stats.excused) / stats.total * 100).toFixed(2) : 0
        };
      })
    );

    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
