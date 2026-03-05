import { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import Header from '../../components/Layout/Header';
import { dashboardAPI, schoolAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  School, 
  CheckCircle, 
  Users, 
  BadgeDollarSign,
  Layers,
  GraduationCap,
  History,
  Activity
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardAPI.getSuperAdmin();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (schoolId, currentStatus) => {
    try {
      await schoolAPI.updateStatus(schoolId, !currentStatus);
      toast.success(`School ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to update school status');
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

  const { summary, recentSchools } = data;

  return (
    <MainLayout>
      <Header title="Super Admin Dashboard" subtitle="Platform overview and analytics" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Schools</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalSchools}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <School className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Active Schools</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{summary.activeSchools}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalStudents}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="text-purple-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Platform Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                ${summary.totalRevenue.toLocaleString()}
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
            <Activity className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold">Platform Statistics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Layers className="text-gray-400" size={18} />
                <span className="font-medium text-gray-700">Total Classes</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{summary.totalClasses}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-gray-400" size={18} />
                <span className="font-medium text-gray-700">Total Teachers</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{summary.totalTeachers}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <History className="text-gray-400" size={18} />
                <span className="font-medium text-gray-700">Total Transactions</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{summary.totalTransactions}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold">School Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={18} />
                <span className="font-medium text-green-700">Active Schools</span>
              </div>
              <span className="text-xl font-bold text-green-600">{summary.activeSchools}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="text-red-500" size={18} />
                <span className="font-medium text-red-700">Inactive Schools</span>
              </div>
              <span className="text-xl font-bold text-red-600">{summary.inactiveSchools}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold">Recent Schools</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSchools.map((school) => (
                <tr key={school._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {school.schoolId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {school.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {school.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      school.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(school.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleToggleStatus(school.schoolId, school.isActive)}
                      className={`text-sm px-4 py-1.5 rounded-lg transition-colors font-medium ${
                        school.isActive 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {school.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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

export default SuperAdminDashboard;
