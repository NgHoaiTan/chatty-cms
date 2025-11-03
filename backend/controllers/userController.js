import Auth from '../models/Auth.js';
import UserProfile from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    // Lấy query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const isActiveFilter = req.query.isActive; // 'true', 'false', 'deleted', hoặc undefined
    
    // Xây dựng filter query
    const filterQuery = {};
    
    // Filter theo trạng thái deleted
    if (isActiveFilter === 'deleted') {
      filterQuery.isDeleted = true;
    } 
    // Filter theo trạng thái active/inactive (chỉ khi không phải deleted)
    else if (isActiveFilter !== undefined && isActiveFilter !== '' && isActiveFilter !== 'all') {
      filterQuery.isActive = isActiveFilter === 'true';
      filterQuery.isDeleted = false; // Chỉ lấy user chưa bị xóa
    } 
    // Khi filter = 'all', lấy tất cả (bao gồm cả deleted) - không thêm điều kiện isDeleted
    
    // Search theo username hoặc email (case-insensitive)
    if (search) {
      filterQuery.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Đếm tổng số users phù hợp với filter
    const totalUsers = await Auth.countDocuments(filterQuery);
    
    // Tính toán pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalUsers / limit);
    
    // Lấy users với filter và pagination
    const auths = await Auth.find(filterQuery)
      .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
      .skip(skip)
      .limit(limit);
    
    // Lấy profiles tương ứng
    const authIds = auths.map(auth => auth._id);
    const profiles = await UserProfile.find({
      authId: { $in: authIds }
    });
    
    // Kết hợp users với profiles
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
      totalUsers: totalUsers,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
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

export const deleteUser = async (req, res) => {
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

    // Soft delete: Set isDeleted = true instead of actually deleting
    await Auth.findByIdAndUpdate(id, { isDeleted: true });

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng'
    });
  }
};

export const restoreUser = async (req, res) => {
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

    // Restore user: Set isDeleted = false
    await Auth.findByIdAndUpdate(id, { isDeleted: false });

    res.json({
      success: true,
      message: 'Khôi phục người dùng thành công'
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi khôi phục người dùng'
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

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, isActive, work, school, location, quote, social } = req.body;
    
    // Find auth by ID
    const auth = await Auth.findById(id);
    
    if (!auth) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Update Auth - không cho phép update email
    const authUpdateData = {};
    if (username !== undefined) {
      authUpdateData.username = username;
    }
    if (isActive !== undefined) {
      authUpdateData.isActive = isActive;
    }

    await Auth.findByIdAndUpdate(id, authUpdateData, { new: true });

    // Update User Profile
    let profile = await UserProfile.findOne({ authId: id });
    
    const profileUpdateData = {};
    if (work !== undefined) profileUpdateData.work = work;
    if (school !== undefined) profileUpdateData.school = school;
    if (location !== undefined) profileUpdateData.location = location;
    if (quote !== undefined) profileUpdateData.quote = quote;
    
    // Update social links
    if (social !== undefined) {
      // If profile exists and has social, merge with existing social
      if (profile && profile.social) {
        profileUpdateData.social = {
          facebook: profile.social.facebook || '',
          instagram: profile.social.instagram || '',
          twitter: profile.social.twitter || '',
          youtube: profile.social.youtube || ''
        };
      } else {
        profileUpdateData.social = {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: ''
        };
      }
      
      // Update only provided social fields
      if (social.facebook !== undefined) profileUpdateData.social.facebook = social.facebook;
      if (social.instagram !== undefined) profileUpdateData.social.instagram = social.instagram;
      if (social.twitter !== undefined) profileUpdateData.social.twitter = social.twitter;
      if (social.youtube !== undefined) profileUpdateData.social.youtube = social.youtube;
    }

    if (profile) {
      // Update existing profile
      await UserProfile.findByIdAndUpdate(profile._id, profileUpdateData, { new: true });
    } else {
      // Create new profile if doesn't exist
      profile = await UserProfile.create({
        authId: id,
        ...profileUpdateData
      });
    }

    // Get updated auth
    const updatedAuth = await Auth.findById(id);
    
    // Get updated profile
    const updatedProfile = await UserProfile.findOne({ authId: id });

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      user: {
        ...updatedAuth.toObject(),
        profile: updatedProfile?.toObject() || null
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật người dùng'
    });
  }
};

