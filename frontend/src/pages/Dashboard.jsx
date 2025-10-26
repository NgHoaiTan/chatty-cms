import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalPosts: 0,
    totalFollowers: 0,
    totalFollowing: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('admin');

      if (!token || !savedAdmin) {
        navigate('/login');
        return;
      }

      // Verify token with backend
      try {
        const response = await axios.get('/api/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAdmin(response.data.admin);
          
          // Fetch stats
          const statsResponse = await axios.get('/api/users/stats', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (statsResponse.data.success) {
            setStats(statsResponse.data.stats);
          }
        } else {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
          navigate('/login');
        }
      } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Xin chào, {admin?.name || admin?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Chào mừng đến với Trang Admin</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng số người dùng</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">{stats.activeUsers}</span> đang hoạt động | 
                <span className="text-red-600"> {stats.inactiveUsers}</span> không hoạt động
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng số bài viết</h3>
              <p className="text-4xl font-bold text-green-600">{stats.totalPosts}</p>
              <p className="text-xs text-gray-500 mt-2">Từ tất cả người dùng</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng số lượt theo dõi</h3>
              <p className="text-4xl font-bold text-purple-600">{stats.totalFollowers}</p>
              <p className="text-xs text-gray-500 mt-2">
                Đang theo dõi: <span className="text-blue-600">{stats.totalFollowing}</span>
              </p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Thông tin Admin</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><span className="font-semibold">ID:</span> {admin?.id}</p>
              <p className="text-gray-700"><span className="font-semibold">Email:</span> {admin?.email}</p>
              <p className="text-gray-700"><span className="font-semibold">Tên:</span> {admin?.name}</p>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

