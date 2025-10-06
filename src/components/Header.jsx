import React from 'react';
import { BookOpen, User, BarChart3, Settings, Library, Languages, MessageCircle, Gamepad2, Sparkles, Shield, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ currentUser, activeTab, onTabChange, onShowAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const baseTabs = [
    { id: 'home', label: 'Home', icon: Sparkles, gradient: 'from-blue-500 to-purple-600' },
    { id: 'learn', label: 'Learn', icon: BookOpen, gradient: 'from-blue-500 to-purple-600' },
    { id: 'chatbot', label: 'AI Chat', icon: MessageCircle, gradient: 'from-green-500 to-teal-600' },
    { id: 'games', label: 'Games', icon: Gamepad2, gradient: 'from-purple-500 to-pink-600' },
    { id: 'translator', label: 'Translator', icon: Languages, gradient: 'from-orange-500 to-red-600' },
    { id: 'vocabulary', label: 'Vocabulary', icon: Library, gradient: 'from-indigo-500 to-blue-600' },
    { id: 'progress', label: 'Progress', icon: BarChart3, gradient: 'from-emerald-500 to-green-600' },
    { id: 'profile', label: 'Profile', icon: User, gradient: 'from-gray-500 to-gray-700' }
  ];

  // Add admin tab if user is admin
  const tabs = user?.role === 'admin'
    ? [...baseTabs, { id: 'admin', label: 'Admin', icon: Shield, gradient: 'from-red-500 to-pink-600' }]
    : baseTabs;

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LinguaLearn
              </h1>
              <p className="text-xs text-gray-500 font-medium">World-Class Language Learning</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md`
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile / Auth */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'admin' ? 'Administrator' : `Level ${user?.preferences?.level || 'beginner'}`}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onTabChange('learn'); // Redirect to learn tab after logout
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onShowAuth('login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onShowAuth('register')}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>


      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200">
        <div className="px-4 py-2">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all min-w-0 flex-shrink-0 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </header>
  );
};

export default Header;