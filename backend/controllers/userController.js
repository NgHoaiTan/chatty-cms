import Auth from '../models/Auth.js';
import UserProfile from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const auths = await Auth.find();
    
    const profiles = await UserProfile.find();
    
    const usersWithProfile = auths.map((auth) => {
      const authObj = auth.toObject();
      
      // Find profile where authId matches auth._id
      const profile = profiles.find(p => {
        const authIdStr = p.authId?.toString();
        const userIdStr = auth._id?.toString();
        return authIdStr === userIdStr;
      });
      
      return {
        ...authObj,
        profile: profile || null
      };
    });

    res.json({
      success: true,
      count: usersWithProfile.length,
      users: usersWithProfile
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng'
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find auth by ID
    const auth = await Auth.findById(id);
    
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Find profile where authId matches auth._id
    const profile = await UserProfile.findOne({ authId: id });

    res.json({
      success: true,
      user: {
        ...auth.toObject(),
        profile: profile?.toObject() || null
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
};

export const getUsersStats = async (req, res) => {
  try {
    // Count all users from Auth collection
    const totalUsers = await Auth.countDocuments();
    
    // Count active users (isActive === true)
    const activeUsers = await Auth.countDocuments({ isActive: true });
    
    // Count inactive users (isActive === false or undefined)
    const inactiveUsers = await Auth.countDocuments({ 
      $or: [
        { isActive: false },
        { isActive: { $exists: false } }
      ]
    });
    
    // Count users joined in current month (based on createdAt)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const usersJoinedThisMonth = await Auth.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
    });
    
    // Get profiles for additional stats
    const profiles = await UserProfile.find();
    const totalPosts = profiles.reduce((sum, profile) => sum + (profile.postsCount || 0), 0);
    const totalFollowers = profiles.reduce((sum, profile) => sum + (profile.followersCount || 0), 0);
    const totalFollowing = profiles.reduce((sum, profile) => sum + (profile.followingCount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersJoinedThisMonth,
        totalPosts,
        totalFollowers,
        totalFollowing
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê'
    });
  }
};

export const getNewUsersThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const auths = await Auth.find({
      createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
    }).sort({ createdAt: -1 });

    const profiles = await UserProfile.find({
      authId: { $in: auths.map(a => a._id) }
    });

    const usersWithProfile = auths.map((auth) => {
      const profile = profiles.find(p => p.authId?.toString() === auth._id?.toString());
      return {
        ...auth.toObject(),
        profile: profile || null
      };
    });

    res.json({
      success: true,
      count: usersWithProfile.length,
      users: usersWithProfile
    });
  } catch (error) {
    console.error('Error fetching new users this month:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy người dùng mới trong tháng'
    });
  }
};

export const getUsersByMonth = async (req, res) => {
  try {
    // Lấy năm từ query parameter, mặc định là năm hiện tại
    let year = parseInt(req.query.year);
    if (!year || isNaN(year)) {
      year = new Date().getFullYear();
    }

    // Validate năm hợp lệ (từ 2000 đến năm hiện tại + 1)
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      year = currentYear;
    }

    const monthsData = [];

    // Lấy số lượng user theo từng tháng trong năm được chọn
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(year, month, 1);
      const startOfNextMonth = new Date(year, month + 1, 1);

      const count = await Auth.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
      });

      const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
      ];

      monthsData.push({
        month: monthNames[month],
        monthNumber: month + 1,
        count: count,
        year: year
      });
    }

    res.json({
      success: true,
      year: year,
      data: monthsData
    });
  } catch (error) {
    console.error('Error fetching users by month:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê user theo tháng'
    });
  }
};

