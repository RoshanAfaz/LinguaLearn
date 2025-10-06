import React, { useState, useEffect } from 'react';
import {
  Users,
  BarChart3,
  Activity,
  Globe,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings,
  Database,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Calendar,
  MessageSquare,
  FileText,
  PieChart,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Ban,
  UserCheck,
  Send,
  TestTube
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminPanel = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState('7d');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Notification states
  const [notificationForm, setNotificationForm] = useState({
    recipientType: 'all',
    subject: '',
    message: '',
    emailType: 'announcement',
    specificUsers: []
  });
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [notificationStats, setNotificationStats] = useState(null);
  const [testEmailForm, setTestEmailForm] = useState({
    email: '',
    type: 'welcome',
    customData: {}
  });

  const { apiCall, user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'sessions') {
      loadSessions();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, currentPage, searchTerm, filterStatus, sortBy, sortOrder, dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/admin/users?page=${currentPage}&search=${searchTerm}&limit=10&status=${filterStatus}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/admin/sessions?page=${currentPage}&limit=20&period=${dateRange}`);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/admin/analytics?period=${dateRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action, userId, data = {}) => {
    try {
      let response;
      switch (action) {
        case 'activate':
          response = await apiCall(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive: true })
          });
          break;
        case 'deactivate':
          response = await apiCall(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive: false })
          });
          break;
        case 'delete':
          response = await apiCall(`/admin/users/${userId}`, {
            method: 'DELETE'
          });
          break;
        case 'resetPassword':
          const newPassword = data.newPassword || 'password123'; // Default password
          response = await apiCall(`/admin/users/${userId}/reset-password`, {
            method: 'PUT',
            body: JSON.stringify({ newPassword })
          });
          break;
        case 'updateRole':
          response = await apiCall(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: data.role })
          });
          break;
        default:
          break;
      }

      if (response?.success) {
        loadUsers(); // Reload users
        setShowConfirmModal(false);
        setConfirmAction(null);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  const exportData = async (type) => {
    try {
      const response = await apiCall(`/admin/export/${type}`, {
        method: 'GET'
      });

      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleUpdateUserStats = async () => {
    if (!confirm('This will recalculate all user statistics based on their completed sessions. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall('/admin/update-user-stats', {
        method: 'POST'
      });

      if (response.success) {
        alert(`Successfully updated statistics for ${response.updatedCount} users!`);
        // Reload users to show updated stats
        loadUsers();
      } else {
        alert('Error updating user statistics: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      alert('Error updating user statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'transform rotate-180' : ''}`} />
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading dashboard data...</span>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dashboard Data</h3>
          <p className="text-gray-600 mb-4">Unable to load dashboard statistics.</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    const { overview = {}, languageStats = [], sessionTypeStats = [], sessionMetrics = {} } = dashboardData;

    return (
      <div className="space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={(overview.totalUsers || 0).toLocaleString()}
            subtitle={`${overview.activeUsers || 0} active`}
            color="blue"
          />
          <StatCard
            icon={Activity}
            title="Total Sessions"
            value={(overview.totalSessions || 0).toLocaleString()}
            subtitle={`${overview.sessionsThisWeek || 0} this week`}
            color="green"
          />
          <StatCard
            icon={BookOpen}
            title="Words Learned"
            value={(overview.totalProgress || 0).toLocaleString()}
            subtitle="across all users"
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="New Users"
            value={overview.newUsersThisWeek || 0}
            subtitle="this week"
            color="orange"
          />
        </div>

        {/* Session Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Accuracy</h3>
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(sessionMetrics.avgAccuracy || 0)}%
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Study Time</h3>
            <div className="text-3xl font-bold text-green-600">
              {Math.round(sessionMetrics.avgTimeSpent || 0)}m
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Avg Words/Session</h3>
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(sessionMetrics.avgWordsStudied || 0)}
            </div>
          </div>
        </div>

        {/* Language Popularity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Languages</h3>
            <div className="space-y-3">
              {languageStats.slice(0, 5).map((lang, index) => (
                <div key={lang.language} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{lang.language.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{lang.sessionCount} sessions</div>
                    <div className="text-xs text-gray-500">{lang.userCount} users</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Types</h3>
            <div className="space-y-3">
              {sessionTypeStats.map((type, index) => (
                <div key={type._id} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 capitalize">{type._id}</span>
                  <span className="text-sm text-gray-600">{type.count} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">Date Joined</option>
                <option value="name">Name</option>
                <option value="lastActive">Last Active</option>
                <option value="stats.totalWordsLearned">Words Learned</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => exportData('users')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={handleUpdateUserStats}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Update Stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learning Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span>{user.stats?.totalWordsLearned || 0} words</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span>{user.stats?.totalSessionsCompleted || 0} sessions</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span>{user.stats?.currentStreak || 0} day streak</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor((Date.now() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                      <div className="text-xs text-gray-500">
                        Level: {user.preferences?.level || 'beginner'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {user.role === 'admin' && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => {
                              setConfirmAction({ type: 'deactivate', userId: user._id, userName: user.name });
                              setShowConfirmModal(true);
                            }}
                            className="p-1 text-yellow-600 hover:text-yellow-800"
                            title="Deactivate User"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setConfirmAction({ type: 'activate', userId: user._id, userName: user.name });
                              setShowConfirmModal(true);
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Activate User"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setConfirmAction({ type: 'delete', userId: user._id, userName: user.name });
                            setShowConfirmModal(true);
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSessions = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Learning Sessions</h3>
            <div className="flex space-x-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={() => exportData('sessions')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-blue-700">Total Sessions</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-green-700">Completion Rate</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">15m</div>
              <div className="text-sm text-purple-700">Avg Duration</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">456</div>
              <div className="text-sm text-orange-700">Active Users</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Sample session data */}
                {[1,2,3,4,5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">User {i}</td>
                    <td className="px-4 py-3 text-sm">Flashcards</td>
                    <td className="px-4 py-3 text-sm">Spanish</td>
                    <td className="px-4 py-3 text-sm">12m 34s</td>
                    <td className="px-4 py-3 text-sm">85%</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderContentManagement = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
            </div>
            <p className="text-gray-600 mb-4">Manage supported languages and their content</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Manage Languages
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Vocabulary</h3>
            </div>
            <p className="text-gray-600 mb-4">Add, edit, and organize vocabulary words</p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Manage Vocabulary
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Prompts</h3>
            </div>
            <p className="text-gray-600 mb-4">Configure AI chatbot prompts and responses</p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Manage Prompts
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15,432</div>
              <div className="text-sm text-gray-600">Vocabulary Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-sm text-gray-600">AI Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-sm text-gray-600">Game Levels</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics</h3>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">User Growth</p>
                  <p className="text-2xl font-bold">+12.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Engagement Rate</p>
                  <p className="text-2xl font-bold">89.2%</p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Retention Rate</p>
                  <p className="text-2xl font-bold">76.8%</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Avg Session Time</p>
                  <p className="text-2xl font-bold">18m</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Learning Progress Trends</h4>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Chart visualization would go here</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">User Activity Heatmap</h4>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2" />
                  <p>Heatmap visualization would go here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Top Performing Content</h4>
            <div className="space-y-3">
              {[
                { name: 'Spanish Basics', engagement: 94, users: 1234 },
                { name: 'French Conversation', engagement: 87, users: 987 },
                { name: 'German Grammar', engagement: 82, users: 756 },
                { name: 'Italian Vocabulary', engagement: 79, users: 654 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.users} active users</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{item.engagement}%</div>
                    <div className="text-xs text-gray-500">engagement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">User Feedback Summary</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Satisfaction</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <span className="text-sm font-medium">4.6/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Quality</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '88%'}}></div>
                  </div>
                  <span className="text-sm font-medium">4.4/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ease of Use</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                  <span className="text-sm font-medium">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSystemSettings = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">User Registration</label>
                  <p className="text-sm text-gray-500">Allow new users to register</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Verification</label>
                  <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Maintenance Mode</label>
                  <p className="text-sm text-gray-500">Put the application in maintenance mode</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Session Timeout (minutes)</label>
                <input type="number" defaultValue="60" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Max Login Attempts</label>
                <input type="number" defaultValue="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Password Min Length</label>
                <input type="number" defaultValue="6" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Database className="h-5 w-5" />
              <span>Backup Database</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <RefreshCw className="h-5 w-5" />
              <span>Optimize Database</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Server Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Uptime:</span>
                  <span className="text-sm font-medium">2d 14h 32m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Memory Usage:</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CPU Usage:</span>
                  <span className="text-sm font-medium">23%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Application Info</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Environment:</span>
                  <span className="text-sm font-medium">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Deploy:</span>
                  <span className="text-sm font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-6 w-6 text-blue-600" />
                <span className="font-medium">User Report</span>
              </div>
              <p className="text-sm text-gray-600">Detailed user activity and engagement metrics</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center space-x-3 mb-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="font-medium">Learning Analytics</span>
              </div>
              <p className="text-sm text-gray-600">Progress tracking and learning outcomes</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="flex items-center space-x-3 mb-2">
                <Globe className="h-6 w-6 text-purple-600" />
                <span className="font-medium">Language Usage</span>
              </div>
              <p className="text-sm text-gray-600">Most popular languages and content</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Monthly User Report - December 2024</div>
                  <div className="text-sm text-gray-500">Generated 2 hours ago</div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:text-blue-800">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:text-green-800">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Notification functions
  const loadNotificationHistory = async () => {
    try {
      const response = await apiCall('/notifications/history');
      if (response.success) {
        setNotificationHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const response = await apiCall('/notifications/stats');
      if (response.success) {
        setNotificationStats(response.data);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationForm.subject.trim() || !notificationForm.message.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    setIsNotificationLoading(true);
    try {
      const response = await apiCall('/notifications/send', {
        method: 'POST',
        body: JSON.stringify(notificationForm)
      });

      if (response.success) {
        alert(`Notification sent successfully to ${response.data.successful} recipients!`);
        setNotificationForm({
          recipientType: 'all',
          subject: '',
          message: '',
          emailType: 'announcement',
          specificUsers: []
        });
        loadNotificationHistory();
      } else {
        alert('Error sending notification: ' + response.message);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailForm.email) {
      alert('Please enter an email address');
      return;
    }

    try {
      const response = await apiCall('/notifications/test', {
        method: 'POST',
        body: JSON.stringify(testEmailForm)
      });

      if (response.success) {
        alert('Test email sent successfully!');
      } else {
        alert('Error sending test email: ' + response.message);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Error sending test email');
    }
  };

  // Load notification data when notifications tab is active
  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotificationHistory();
      loadNotificationStats();
    }
  }, [activeTab]);

  const renderNotifications = () => {

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        {notificationStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.userStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.userStats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.emailStats.totalSent}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationStats.emailStats.deliveryRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Notification Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Send Notification</h3>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Recipient Type</label>
                <select
                  value={notificationForm.recipientType}
                  onChange={(e) => setNotificationForm({...notificationForm, recipientType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users Only</option>
                  <option value="inactive">Inactive Users Only</option>
                  <option value="specific">Specific Users</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email Type</label>
                <select
                  value={notificationForm.emailType}
                  onChange={(e) => setNotificationForm({...notificationForm, emailType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="update">🔄 Update</option>
                  <option value="promotion">🎉 Promotion</option>
                  <option value="reminder">⏰ Reminder</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Subject</label>
              <input
                type="text"
                value={notificationForm.subject}
                onChange={(e) => setNotificationForm({...notificationForm, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email subject..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Message</label>
              <textarea
                rows="6"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your message here..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isNotificationLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isNotificationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Test Email Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Test Email</h3>
          <form onSubmit={handleSendTestEmail} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Test Email Address</label>
                <input
                  type="email"
                  value={testEmailForm.email}
                  onChange={(e) => setTestEmailForm({...testEmailForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter test email address..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email Template</label>
                <select
                  value={testEmailForm.type}
                  onChange={(e) => setTestEmailForm({...testEmailForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="welcome">🎉 Welcome Email</option>
                  <option value="achievement">🏆 Achievement Email</option>
                  <option value="milestone">🎯 Milestone Email</option>
                  <option value="streak">🔥 Streak Email</option>
                  <option value="custom">📧 Custom Email</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <TestTube className="h-4 w-4" />
              <span>Send Test Email</span>
            </button>
          </form>
        </div>

        {/* Notification History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Recent Notifications</h3>
          <div className="space-y-3">
            {notificationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications sent yet</p>
              </div>
            ) : (
              notificationHistory.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>📧 {notification.recipientCount} recipients</span>
                          <span>✅ {notification.successCount} delivered</span>
                          {notification.failedCount > 0 && <span>❌ {notification.failedCount} failed</span>}
                          <span>📅 {new Date(notification.sentAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.emailType === 'announcement' ? 'bg-blue-100 text-blue-800' :
                          notification.emailType === 'update' ? 'bg-green-100 text-green-800' :
                          notification.emailType === 'promotion' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {notification.emailType}
                        </span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {Math.round((notification.successCount / notification.recipientCount) * 100)}% delivered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'sessions', label: 'Learning Sessions', icon: BookOpen },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'reports', label: 'Reports', icon: PieChart },
    { id: 'notifications', label: 'Notifications', icon: Mail }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage users and monitor app performance</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'sessions' && renderSessions()}
        {activeTab === 'content' && renderContentManagement()}
        {activeTab === 'system' && renderSystemSettings()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowUserModal(false)}></div>
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedUser.stats?.totalWordsLearned || 0}
                    </div>
                    <div className="text-sm text-blue-700">Words Learned</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedUser.stats?.totalSessionsCompleted || 0}
                    </div>
                    <div className="text-sm text-green-700">Sessions Completed</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedUser.stats?.currentStreak || 0}
                    </div>
                    <div className="text-sm text-purple-700">Current Streak</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((selectedUser.stats?.totalStudyTime || 0) / 60)}h
                    </div>
                    <div className="text-sm text-orange-700">Study Time</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Preferences</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Preferred Language:</span>
                        <span className="ml-2 font-medium">{selectedUser.preferences?.preferredLanguage || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Level:</span>
                        <span className="ml-2 font-medium capitalize">{selectedUser.preferences?.level || 'beginner'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Daily Goal:</span>
                        <span className="ml-2 font-medium">{selectedUser.preferences?.dailyGoal || 10} words</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Notifications:</span>
                        <span className="ml-2 font-medium">{selectedUser.preferences?.notifications ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowConfirmModal(false)}></div>
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to {confirmAction.type} user "{confirmAction.userName}"?
                  {confirmAction.type === 'delete' && ' This action cannot be undone.'}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUserAction(confirmAction.type, confirmAction.userId)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {confirmAction.type === 'delete' ? 'Delete' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
