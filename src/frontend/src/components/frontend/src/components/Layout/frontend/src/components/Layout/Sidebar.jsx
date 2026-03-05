import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FlaskConical, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  DollarSign, 
  FileText,
  LogOut,
  School
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      title: 'Dashboard',
      path: user?.role === 'super_admin' ? '/super-admin' : '/dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['super_admin', 'school_admin', 'teacher', 'student']
    },
    {
      title: 'Classes',
      path: '/classes',
      icon: <BookOpen size={20} />,
      roles: ['school_admin', 'teacher']
    },
    {
      title: 'Subjects',
      path: '/subjects',
      icon: <FlaskConical size={20} />,
      roles: ['school_admin', 'teacher']
    },
    {
      title: 'Students',
      path: '/students',
      icon: <Users size={20} />,
      roles: ['school_admin', 'teacher']
    },
    {
      title: 'Teachers',
      path: '/teachers',
      icon: <GraduationCap size={20} />,
      roles: ['school_admin']
    },
    {
      title: 'Attendance',
      path: '/attendance',
      icon: <ClipboardCheck size={20} />,
      roles: ['school_admin', 'teacher']
    },
    {
      title: 'Payments',
      path: '/payments',
      icon: <DollarSign size={20} />,
      roles: ['school_admin', 'student']
    },
    {
      title: 'Exam Results',
      path: '/exams',
      icon: <FileText size={20} />,
      roles: ['school_admin', 'teacher', 'student']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <School className="text-primary-600" size={28} />
          <h1 className="text-2xl font-bold text-primary-600">SchoolMS</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">
          {user?.role?.replace('_', ' ')}
        </p>
      </div>
      
      <nav className="mt-6">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 ${
              isActive(item.path) ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
            }`}
          >
            <span className={`mr-3 ${isActive(item.path) ? 'text-primary-600' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t bg-gray-50/50">
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
          {user?.schoolId && (
            <p className="text-xs text-gray-500">ID: {user.schoolId}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg active:scale-95"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
