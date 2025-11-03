import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Filter và search states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const limit = 10;

  // Hàm fetch posts với filter, search và pagination
  const fetchPosts = async (page = 1, search = '') => {
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

      const response = await axios.get(`/api/posts?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setPosts(response.data.posts);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
        setTotalPosts(response.data.totalPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts khi component mount
  useEffect(() => {
    fetchPosts(1, '');
  }, [navigate]);

  // Fetch khi đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchPosts(newPage, searchTerm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Xử lý khi nhấn nút tìm kiếm
  const handleSearch = () => {
    setCurrentPage(1);
    fetchPosts(1, searchTerm);
  };

  // Xử lý khi nhấn Enter trong ô search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  // Tính tổng reactions
  const getTotalReactions = (reactions) => {
    if (!reactions) return 0;
    return reactions.total || Object.values(reactions).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
  };

  if (loading && posts.length === 0) {
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý bài viết</h1>
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
                Danh sách bài viết ({totalPosts})
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Tất cả bài viết trong hệ thống</p>
            </div>

            {/* Filter and Search Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo nội dung hoặc tên người dùng..."
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
            </div>

            {/* Posts List */}
            {loading && posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-600">Đang tải...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-600">Không tìm thấy bài viết nào.</div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                          style={{ backgroundColor: post.avatarColor || '#448aff' }}
                        >
                          {post.username?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          {/* User Info */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{post.username || 'Anonymous'}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                          </div>

                          {/* Post Text */}
                          {post.post && (
                            <div className="mb-3 text-gray-800 whitespace-pre-wrap wrap-break-word">
                              {post.post}
                            </div>
                          )}

                          {/* Post Image */}
                          {post.imgId && (
                            <div className="mb-3">
                              <img
                                src={post.gifUrl || `https://res.cloudinary.com/dlduxwmjg/image/upload/v${post.imgVersion}/${post.imgId}`}
                                alt="Post"
                                className="max-w-full h-auto rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          {/* Post Video */}
                          {post.videoId && (
                            <div className="mb-3">
                              <video
                                controls
                                className="max-w-full h-auto rounded-lg"
                                src={`https://res.cloudinary.com/dlduxwmjg/video/upload/v${post.videoVersion}/${post.videoId}`}
                              />
                            </div>
                          )}

                          {/* Feelings */}
                          {post.feelings && (
                            <div className="mb-3 text-sm text-gray-600">
                              <span className="italic">😊 Cảm xúc: {post.feelings}</span>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-700">Reactions:</span>
                              <span>{getTotalReactions(post.reactions)}</span>
                              {post.reactions && (
                                <span className="ml-2 text-xs">
                                  {post.reactions.like > 0 && `👍 ${post.reactions.like} `}
                                  {post.reactions.love > 0 && `❤️ ${post.reactions.love} `}
                                  {post.reactions.happy > 0 && `😄 ${post.reactions.happy} `}
                                  {post.reactions.wow > 0 && `😲 ${post.reactions.wow} `}
                                  {post.reactions.sad > 0 && `😢 ${post.reactions.sad} `}
                                  {post.reactions.angry > 0 && `😠 ${post.reactions.angry} `}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-700">Comments:</span>
                              <span>{post.commentsCount || 0}</span>
                            </div>
                            {post.privacy && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-gray-700">Privacy:</span>
                                <span className="capitalize">{post.privacy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-0">
                    <div className="text-sm text-gray-700">
                      Hiển thị {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalPosts)} trong tổng số {totalPosts} bài viết
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default Posts;
