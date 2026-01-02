import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API Config
const API_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-h90t.onrender.com';

// Simple store
let globalState = {
  user: null,
  token: null,
  darkMode: false
};

const listeners = new Set();
const notify = () => listeners.forEach(fn => fn());

export const useStore = () => {
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const fn = () => forceUpdate({});
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  return {
    user: globalState.user,
    token: globalState.token,
    darkMode: globalState.darkMode,
    setUser: (user, token) => {
      globalState.user = user;
      globalState.token = token;
      if (token) localStorage.setItem('token', token);
      else localStorage.removeItem('token');
      notify();
    },
    setDarkMode: (mode) => {
      globalState.darkMode = mode;
      document.documentElement.classList.toggle('dark', mode);
      notify();
    }
  };
};

// Layout Component
const Layout = ({ children }) => {
  const { user, setUser, darkMode, setDarkMode } = useStore();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const logout = () => {
    setUser(null, null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LearnHub
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">Courses</Link>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                {darkMode ? '☀️' : '🌙'}
              </button>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="btn-primary">Dashboard</Link>
                  <button onClick={logout} className="btn-secondary">Logout</button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link to="/login" className="btn-secondary">Login</Link>
                  <Link to="/register" className="btn-primary">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};

// Home Page
const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Learn Without Limits
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Access thousands of courses taught by industry experts
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/register')} className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg">
              Get Started Free
            </button>
            <button onClick={() => navigate('/courses')} className="bg-transparent border-2 border-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg text-lg">
              Browse Courses
            </button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="card hover:scale-105 transition-transform cursor-pointer">
                <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg mb-4" />
                <h3 className="text-xl font-bold mb-2">Course Title {i}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Learn amazing skills with this comprehensive course</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">$49.99</span>
                  <span className="text-sm text-gray-500">⭐ 4.8 (1.2k)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Login Page
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      setUser(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <button onClick={handleLogin} className="btn-primary w-full">
            Sign In
          </button>
          <p className="text-center text-sm">
            Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Register Page
const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { email, password, role });
      setUser(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">I want to...</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
              <option value="student">Learn (Student)</option>
              <option value="instructor">Teach (Instructor)</option>
            </select>
          </div>
          <button onClick={handleRegister} className="btn-primary w-full">
            Create Account
          </button>
          <p className="text-center text-sm">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Dashboard Router
const DashboardPage = () => {
  const { user } = useStore();
  
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'student') return <StudentDashboard />;
  if (user.role === 'instructor') return <InstructorDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;
  
  return <Navigate to="/" />;
};

// Student Dashboard
const StudentDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">My Learning</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-gray-600 dark:text-gray-400">Enrolled Courses</p>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-gray-600 dark:text-gray-400">Completed</p>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">📈</div>
          <h3 className="text-2xl font-bold">0%</h3>
          <p className="text-gray-600 dark:text-gray-400">Progress</p>
        </div>
      </div>
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Get Started</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet. Browse our catalog to start learning!</p>
        <Link to="/courses" className="btn-primary">Browse Courses</Link>
      </div>
    </div>
  );
};

// Instructor Dashboard
const InstructorDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Instructor Dashboard</h1>
        <button className="btn-primary">Create New Course</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: '📚', label: 'Courses', value: '0' },
          { icon: '👥', label: 'Students', value: '0' },
          { icon: '💰', label: 'Revenue', value: '$0' },
          { icon: '⭐', label: 'Rating', value: '0.0' }
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="text-4xl mb-2">{stat.icon}</div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Get Started Teaching</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first course and start earning! Share your knowledge with students worldwide.</p>
        <button className="btn-primary">Create Your First Course</button>
      </div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Control Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: '👥', label: 'Total Users', value: '0' },
          { icon: '📚', label: 'Courses', value: '0' },
          { icon: '⏳', label: 'Pending', value: '0' },
          { icon: '💰', label: 'Revenue', value: '$0' }
        ].map((stat, i) => (
          <div key={i} className="card">
            <div className="text-4xl mb-2">{stat.icon}</div>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
            <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">⏳ Pending Approvals</h3>
          <p className="text-gray-600 dark:text-gray-400">No pending approvals</p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold mb-4">📊 Recent Activity</h3>
          <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

// Courses Page
const CoursesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center dark:text-white">Explore Courses</h1>
      <div className="mb-8">
        <input 
          type="text"
          placeholder="Search courses..."
          className="input max-w-2xl mx-auto block"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <p className="text-gray-600 dark:text-gray-400">No courses available yet</p>
        </div>
      </div>
    </div>
  );
};

// Main App
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}