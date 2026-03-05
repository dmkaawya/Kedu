import { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import Header from '../../components/Layout/Header';
import { attendanceAPI, classAPI, studentAPI, subjectAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedSubject, selectedDate]);

  const fetchInitialData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        classAPI.getAll(),
        subjectAPI.getAll()
      ]);
      setClasses(classesRes.data.classes);
      setSubjects(subjectsRes.data.subjects);
    } catch (error) {
      toast.error('Failed to load classes or subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    try {
      const studentRes = await studentAPI.getByClass(selectedClass);
      setStudents(studentRes.data.students);

      // Try to fetch existing attendance
      try {
        const attendRes = await attendanceAPI.getByClass(selectedClass, { 
          date: selectedDate,
          subjectId: selectedSubject
        });
        
        const records = {};
        // Initialize with 'present' for all students first
        studentRes.data.students.forEach(s => records[s._id] = 'present');
        
        // Overlay existing records
        attendRes.data.attendance.forEach(att => {
          records[att.studentId._id] = att.status;
        });
        setAttendanceRecords(records);
      } catch (err) {
        // No attendance yet, default to all present
        const records = {};
        studentRes.data.students.forEach(s => records[s._id] = 'present');
        setAttendanceRecords(records);
      }
    } catch (error) {
      toast.error('Failed to load student data');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) {
      toast.error('Please select both class and subject');
      return;
    }

    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      status,
      remarks: ''
    }));

    try {
      await attendanceAPI.mark({
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate,
        attendanceRecords: records
      });
      toast.success('Attendance records saved');
      fetchStudentsAndAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
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

  return (
    <MainLayout>
      <Header title="Attendance" subtitle="Subject-based attendance management" />

      <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.name} - {cls.grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              >
                <option value="">Select Subject</option>
                {subjects.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />
            </div>
          </div>

          {selectedClass && selectedSubject && students.length > 0 ? (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Student Roster</h3>
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {students.length} Students
                </span>
              </div>
              <div className="overflow-hidden border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {student.personalInfo.firstName} {student.personalInfo.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                             {['present', 'absent', 'late', 'excused'].map(status => (
                               <button
                                 key={status}
                                 type="button"
                                 onClick={() => handleStatusChange(student._id, status)}
                                 className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                                   attendanceRecords[student._id] === status
                                     ? status === 'present' ? 'bg-green-600 text-white shadow-lg shadow-green-200' :
                                       status === 'absent' ? 'bg-red-600 text-white shadow-lg shadow-red-200' :
                                       status === 'late' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200' :
                                       'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                     : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                 }`}
                               >
                                 {status}
                               </button>
                             ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 font-bold shadow-xl shadow-primary-200 transition-all hover:-translate-y-0.5"
                >
                  Confirm & Save Attendance
                </button>
              </div>
            </div>
          ) : selectedClass && selectedSubject && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mt-6">
               <p className="text-gray-500 italic font-medium">No students found in this class.</p>
            </div>
          )}
        </form>
      </div>
    </MainLayout>
  );
};

export default Attendance;
