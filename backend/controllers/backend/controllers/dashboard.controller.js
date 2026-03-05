import School from '../models/School.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';
import ExamResult from '../models/ExamResult.js';

export const getSchoolAdminDashboard = async (req, res) => {
  try {
    const { schoolId } = req.user;

    if (!schoolId) {
      return res.status(403).json({ message: 'School access required' });
    }

    // Get counts
    const [totalStudents, totalClasses, totalTeachers] = await Promise.all([
      Student.countDocuments({ schoolId, isActive: true }),
      Class.countDocuments({ schoolId }),
      Teacher.countDocuments({ schoolId, isActive: true })
    ]);

    // Get attendance summary (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          schoolId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const attendanceSummary = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    attendanceStats.forEach(stat => {
      attendanceSummary[stat._id] = stat.count;
    });

    // Get payment summary (last 30 days)
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          schoolId,
          paymentDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const paymentSummary = {
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalAmount: 0
    };

    paymentStats.forEach(stat => {
      if (stat._id === 'paid') {
        paymentSummary.totalPaid = stat.total;
        paymentSummary.totalAmount += stat.total;
      } else if (stat._id === 'pending') {
        paymentSummary.totalPending = stat.total;
      } else if (stat._id === 'overdue') {
        paymentSummary.totalOverdue = stat.total;
      }
    });

    // Recent activities
    const recentStudents = await Student.find({ schoolId, isActive: true })
      .populate('classId', 'name grade')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('studentId personalInfo classId');

    res.json({
      summary: {
        totalStudents,
        totalClasses,
        totalTeachers,
        attendanceSummary,
        paymentSummary
      },
      recentStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuperAdminDashboard = async (req, res) => {
  try {
    // Get all schools count
    const totalSchools = await School.countDocuments();
    const activeSchools = await School.countDocuments({ isActive: true });

    // Get platform statistics
    const [totalStudents, totalClasses, totalTeachers] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Class.countDocuments(),
      Teacher.countDocuments({ isActive: true })
    ]);

    // Get schools by status
    const schoolsByStatus = await School.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent schools
    const recentSchools = await School.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('schoolId name email isActive registrationDate');

    // Revenue summary (if needed)
    const revenueStats = await Payment.aggregate([
      {
        $match: {
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: {
        totalSchools,
        activeSchools,
        inactiveSchools: totalSchools - activeSchools,
        totalStudents,
        totalClasses,
        totalTeachers,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        totalTransactions: revenueStats[0]?.totalTransactions || 0
      },
      recentSchools,
      schoolsByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
