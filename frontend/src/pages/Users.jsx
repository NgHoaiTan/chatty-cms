import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Filter và search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'true', 'false'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;

  // Hàm fetch users với filter, search và pagination
  const fetchUsers = async (page = 1, search = '', filter = 'all') => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Xây dựng query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (filter !== 'all') {
        params.append('isActive', filter);
      }

      const response = await axios.get(`/api/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.totalUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users khi component mount
  useEffect(() => {
    fetchUsers(1, '', 'all');
  }, [navigate]);

  // Fetch khi đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchUsers(newPage, searchTerm, activeFilter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Xử lý khi thay đổi filter
  const handleFilterChange = (e) => {
    setActiveFilter(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi filter
    fetchUsers(1, searchTerm, e.target.value);
  };

  // Xử lý khi nhấn nút tìm kiếm
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchTerm, activeFilter);
  };

  // Xử lý khi nhấn Enter trong ô search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Xử lý xóa user (soft delete)
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Xóa người dùng thành công!');
        // Refetch users sau khi xóa
        fetchUsers(currentPage, searchTerm, activeFilter);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  // Xử lý khôi phục user
  const handleRestoreUser = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn khôi phục người dùng "${username}"?`)) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/api/users/${userId}/restore`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('Khôi phục người dùng thành công!');
        // Refetch users sau khi khôi phục
        fetchUsers(currentPage, searchTerm, activeFilter);
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('Có lỗi xảy ra khi khôi phục người dùng');
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      uId: user.uId || '',
      isActive: user.isActive || false,
      work: user.profile?.work || '',
      school: user.profile?.school || '',
      location: user.profile?.location || '',
      quote: user.profile?.quote || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      // TODO: Thêm API endpoint để update user
      // await axios.put(`/api/users/${selectedUser._id}`, formData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Update locally for now
      const updatedUsers = users.map(user => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            username: formData.username,
            email: formData.email,
            isActive: formData.isActive,
            profile: {
              ...user.profile,
              work: formData.work,
              school: formData.school,
              location: formData.location,
              quote: formData.quote
            }
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      alert('Cập nhật thành công! (Demo - chưa có API)');
      setShowModal(false);
      // Refetch users để đảm bảo dữ liệu đồng bộ
      fetchUsers(currentPage, searchTerm, activeFilter);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Có lỗi xảy ra khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('lúc', '').trim();
  };

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
          <div className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base w-full sm:w-auto"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">
              Danh sách người dùng ({totalUsers})
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Click vào người dùng để chỉnh sửa thông tin</p>
          </div>

          {/* Filter and Search Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Filter Dropdown */}
            <div className="sm:w-48">
              <select
                value={activeFilter}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="true">ACTIVE</option>
                <option value="false">INACTIVE</option>
                <option value="deleted">DELETED</option>
              </select>
            </div>
          </div>

          {/* Users List */}
          {loading && users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Đang tải...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Không tìm thấy người dùng nào.</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posts
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Followers
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Joined
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-blue-50 transition"
                  >
                    <td 
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-center">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: user.avatarColor || '#448aff' }}
                        >
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-2 sm:ml-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {user.username}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">@{user.uId}</div>
                        </div>
                      </div>
                    </td>
                    <td 
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px]">{user.email}</div>
                    </td>
                    <td 
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="text-xs sm:text-sm text-gray-900">
                        {user.profile?.postsCount || 0}
                      </div>
                    </td>
                    <td 
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="text-xs sm:text-sm text-gray-900">
                        {user.profile?.followersCount || 0}
                      </div>
                    </td>
                    <td 
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isDeleted === true
                            ? 'bg-gray-100 text-gray-800'
                            : user.isActive === true
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isDeleted === true ? 'DELETED' : (user.isActive === true ? 'ACTIVE' : 'INACTIVE')}
                      </span>
                    </td>
                    <td 
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                      {user.isDeleted ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreUser(user._id, user.username || user.email);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                          title="Khôi phục người dùng"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user._id, user.username || user.email);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Xóa người dùng"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-0">
                  <div className="text-sm text-gray-700">
                    Hiển thị {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalUsers)} trong tổng số {totalUsers} người dùng
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Trước
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Chỉ hiển thị một số trang gần trang hiện tại
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 border rounded-lg transition ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2 py-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div className="px-2 sm:px-0">
            <div className="mt-4 text-center sm:hidden">
              <p className="text-sm text-gray-500">Kéo sang để xem thêm</p>
            </div>
          </div>
        </div>
        </main>
      </div>

      {/* Modal for Edit User */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa người dùng</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info Form */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4 text-lg">Thông tin cơ bản</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên người dùng
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-xs text-gray-500">(không thể chỉnh sửa)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UID
                      </label>
                      <input
                        type="text"
                        name="uId"
              
                        value={formData.uId}
                        readOnly
                        disabled
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Tài khoản đang hoạt động
                      </label>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Ngày tạo: {formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Info Form */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4 text-lg">Thông tin bổ sung</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Công việc
                      </label>
                      <input
                        type="text"
                        name="work"
                        value={formData.work}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trường học
                      </label>
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quote
                      </label>
                      <textarea
                        name="quote"
                        value={formData.quote}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Read-only stats */}
                    {selectedUser.profile && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Bài viết:</span> {selectedUser.profile.postsCount || 0} | 
                          <span className="font-medium"> Người theo dõi:</span> {selectedUser.profile.followersCount || 0}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;

