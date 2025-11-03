import { PostModel } from '../models/Post.js';
import { CommentsModel } from '../models/Comment.js';
import { ReactionModel } from '../models/Reaction.js';

export const getPosts = async (req, res) => {
  try {
    // Lấy query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Xây dựng filter query
    const filterQuery = {};
    
    // Search theo nội dung post hoặc username (case-insensitive)
    if (search) {
      filterQuery.$or = [
        { post: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Đếm tổng số posts phù hợp với filter
    const totalPosts = await PostModel.countDocuments(filterQuery);
    
    // Tính toán pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalPosts / limit);
    
    // Lấy posts với filter và pagination, sắp xếp theo ngày tạo mới nhất
    const posts = await PostModel.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    // Lấy số lượng comments và reactions thực tế từ database cho mỗi post
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const postId = post._id;
        
        // Đếm số lượng comments
        const commentsCount = await CommentsModel.countDocuments({ postId });
        
        // Đếm số lượng reactions theo từng loại
        const reactions = await ReactionModel.find({ postId });
        const reactionsByType = {
          like: 0,
          love: 0,
          happy: 0,
          wow: 0,
          sad: 0,
          angry: 0
        };
        
        reactions.forEach((reaction) => {
          const type = reaction.type?.toLowerCase();
          if (reactionsByType.hasOwnProperty(type)) {
            reactionsByType[type]++;
          }
        });
        
        return {
          ...post,
          commentsCount: commentsCount,
          reactions: {
            ...reactionsByType,
            total: Object.values(reactionsByType).reduce((sum, count) => sum + count, 0)
          }
        };
      })
    );

    res.json({
      success: true,
      count: postsWithStats.length,
      totalPosts: totalPosts,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      posts: postsWithStats
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài viết'
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await PostModel.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Lấy số lượng comments
    const commentsCount = await CommentsModel.countDocuments({ postId: id });
    
    // Lấy reactions
    const reactions = await ReactionModel.find({ postId: id });
    const reactionsByType = {
      like: 0,
      love: 0,
      happy: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };
    
    reactions.forEach((reaction) => {
      const type = reaction.type?.toLowerCase();
      if (reactionsByType.hasOwnProperty(type)) {
        reactionsByType[type]++;
      }
    });

    res.json({
      success: true,
      post: {
        ...post.toObject(),
        commentsCount: commentsCount,
        reactions: {
          ...reactionsByType,
          total: Object.values(reactionsByType).reduce((sum, count) => sum + count, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin bài viết'
    });
  }
};

