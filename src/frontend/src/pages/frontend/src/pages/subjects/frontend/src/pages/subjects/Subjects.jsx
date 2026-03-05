import { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import Header from '../../components/Layout/Header';
import { subjectAPI, teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Plus, BookOpen, User } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
// ... rest of the component state
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    teachers: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, teachersRes] = await Promise.all([
        subjectAPI.getAll(),
        teacherAPI.getAll()
      ]);
      setSubjects(subjectsRes.data.subjects);
      setTeachers(teachersRes.data.teachers);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await subjectAPI.create(formData);
      toast.success('Subject created successfully');
      setShowModal(false);
      setFormData({ name: '', code: '', description: '', teachers: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleTeacherToggle = (teacherId) => {
    setFormData(prev => {
      const newTeachers = prev.teachers.includes(teacherId)
        ? prev.teachers.filter(id => id !== teacherId)
        : [...prev.teachers, teacherId];
      return { ...prev, teachers: newTeachers };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This may affect classes and results.')) return;
    try {
      await subjectAPI.delete(id);
      toast.success('Subject deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  if (loading) {
// ... existing loading block
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
      <div className="flex justify-between items-center mb-6">
        <Header title="Subjects" subtitle="Academic subjects management" />
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div key={subject._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all">
            <button 
              onClick={() => handleDelete(subject._id)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete Subject"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <BookOpen className="text-primary-600" size={20} />
              </div>
              <div className="text-xs font-bold text-primary-600 tracking-wider uppercase">{subject.code}</div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{subject.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{subject.description || 'No description provided.'}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-50 uppercase tracking-tight">
              <p className="text-[10px] font-bold text-gray-400 mb-3 flex items-center gap-1">
                <User size={12} />
                Assigned Teachers
              </p>
              <div className="flex flex-wrap gap-2">
                {subject.teachers?.length > 0 ? subject.teachers.map((t, idx) => (
                  <span key={idx} className="bg-gray-50 text-gray-600 border border-gray-100 px-2 py-1 rounded text-[11px] font-semibold">
                     {t.profile?.firstName} {t.profile?.lastName}
                  </span>
                )) : <span className="text-xs text-gray-400 italic">No teachers assigned</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">New Subject</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. MATH101"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none transition-all"
                  placeholder="Subject details..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Assign Teachers</label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg bg-gray-50">
                   {teachers.map(teacher => (
                     <label key={teacher._id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                        <input 
                          type="checkbox"
                          checked={formData.teachers.includes(teacher.userId?._id)}
                          onChange={() => handleTeacherToggle(teacher.userId?._id)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {teacher.personalInfo?.firstName} {teacher.personalInfo?.lastName}
                        </span>
                     </label>
                   ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Note: Subjects use User accounts for assignment.</p>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95">
                  Save Subject
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Subjects;
