import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              McqQuiz
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {user?.role === 'teacher' ? (
              <>
                <Link to="/teacher" className="nav-link">Dashboard</Link>
                <Link to="/create-exam" className="nav-link">Create Exam</Link>
              </>
            ) : (
              <Link to="/student" className="nav-link">Dashboard</Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Profile Picture */}
            <Link to="/profile" className="block">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <img
                  src={user?.profileImage 
                    ? `http://localhost:5001${user.profileImage}` 
                    : `https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50">
                  
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                  </div>
                  
                  {/* Mobile Navigation Links */}
                  <div className="md:hidden px-2 py-2 border-b border-gray-200 dark:border-gray-600">
                    {user?.role === 'teacher' ? (
                      <>
                        <Link to="/teacher" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                          📊 Dashboard
                        </Link>
                        <Link to="/create-exam" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                          📝 Create Exam
                        </Link>
                      </>
                    ) : (
                      <Link to="/student" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                        📊 Dashboard
                      </Link>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      👤 Profile Settings
                    </Link>
                    
                    <Link
                      to="/help"
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                       Help Desk
                    </Link>
                    
                    <Link
                      to="/contact"
                      className="menu-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                       Contact Us
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="menu-item text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    >
                       Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;