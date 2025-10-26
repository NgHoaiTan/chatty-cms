import Auth from '../models/Auth.js';
import UserProfile from '../models/UserProfile.js';

export const getUsers = async (req, res) => {
  try {
    // Get all auth records (users from Auth collection)
    const auths = await Auth.find();
    
    // Get all user profiles
    const profiles = await UserProfile.find();
    
    // Combine auth data with profile data
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

