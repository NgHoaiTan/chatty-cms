import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Pre-configured admin accounts (in-memory for now)
const adminAccounts = [
  {
    id: 1,
    email: 'admin@chatty.com',
    password: '$2b$10$SVoFICZezIHlZyb8P5ijT.rB1mhPSsgVOEhMoNHIaZ0Rg3kM02oyS', // admin123
    name: 'Admin User'
  }
];

// Log admin credentials on startup
console.log('\n========== ADMIN CREDENTIALS ==========');
console.log('Email: admin@chatty.com');
console.log('Password: admin123');
console.log('=====================================\n');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email và mật khẩu là bắt buộc' 
      });
    }

    // Find admin by email
    const admin = adminAccounts.find(acc => acc.email === email);

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server, vui lòng thử lại' 
    });
  }
});

// Protected route - Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token xác thực' 
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    
    const admin = adminAccounts.find(acc => acc.id === decoded.id);
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ' 
    });
  }
});

export default router;

