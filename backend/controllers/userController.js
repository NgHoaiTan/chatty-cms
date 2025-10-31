import Auth from '../models/Auth.js';
import UserProfile from '../models/UserProfile.js';

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

    const count = await Auth.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
    });

    res.json({ success: true, month: now.getMonth() + 1, year: now.getFullYear(), newUsers: count });
  } catch (error) {
    console.error('Error fetching new users this month:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy số thành viên mới tháng này' });
  }
};

