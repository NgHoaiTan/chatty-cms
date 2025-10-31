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
    usersJoinedThisMonth: 0,
    totalPosts: 0,
    totalFollowers: 0,
    totalFollowing: 0
  });
  const [newUsers, setNewUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

          // Fetch new users this month
          const newUsersResp = await axios.get('/api/users/new-this-month', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (newUsersResp.data.success) {
            setNewUsers(newUsersResp.data.users || []);
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
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng số người dùng</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-green-600">{stats.activeUsers}</span> đang hoạt động | 
                <span className="text-red-600"> {stats.inactiveUsers}</span> không hoạt động
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-500">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Tổng số người dùng mới</h3>
              <p className="text-4xl font-bold text-indigo-600">{stats.usersJoinedThisMonth}</p>
              <p className="text-xs text-gray-500 mt-2">Tính từ đầu tháng đến nay</p>
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

          {/* New Users This Month */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Người dùng mới </h3>
            {newUsers.length === 0 ? (
              <p className="text-gray-600">Chưa có người dùng mới trong tháng.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newUsers.slice(0, 10).map((u) => (
                      <tr key={u._id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{u.username || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{u.email || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{u.uId || '-'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {newUsers.length > 10 && (
                  <p className="text-xs text-gray-500 mt-2">Hiển thị 10 người dùng mới nhất</p>
                )}
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

