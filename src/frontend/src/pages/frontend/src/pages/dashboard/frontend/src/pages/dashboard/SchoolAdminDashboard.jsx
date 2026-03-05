import { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import Header from '../../components/Layout/Header';
import { dashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  BadgeDollarSign,
  PieChart as PieChartIcon,
  CreditCard,
  UserPlus
} from 'lucide-react';

const SchoolAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getSchoolAdmin();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!data) return null;

  const { summary, recentStudents } = data;

  const attendanceData = [
    { name: 'Present', value: summary.attendanceSummary.present },
    { name: 'Absent', value: summary.attendanceSummary.absent },
    { name: 'Late', value: summary.attendanceSummary.late },
    { name: 'Excused', value: summary.attendanceSummary.excused }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <MainLayout>
      <Header title="Dashboard" subtitle="Overview of your school" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Classes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalClasses}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="text-green-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalTeachers}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <GraduationCap className="text-purple-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${summary.paymentSummary.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <BadgeDollarSign className="text-amber-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold">Attendance Summary (Last 30 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold">Payment Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
              <span className="font-medium text-green-700">Paid</span>
              <span className="text-xl font-bold text-green-600">
                ${summary.paymentSummary.totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <span className="font-medium text-yellow-700">Pending</span>
              <span className="text-xl font-bold text-yellow-600">
                ${summary.paymentSummary.totalPending.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100">
              <span className="font-medium text-red-700">Overdue</span>
              <span className="text-xl font-bold text-red-600">
                ${summary.paymentSummary.totalOverdue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="text-primary-600" size={20} />
          <h3 className="text-lg font-semibold">Recent Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.personalInfo.firstName} {student.personalInfo.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.classId?.name || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default SchoolAdminDashboard;
