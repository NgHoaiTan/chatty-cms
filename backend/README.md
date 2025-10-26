# Backend - Chatty CMS Admin Panel

Backend API cho hệ thống quản trị admin panel.

## Cấu trúc dự án

```
backend/
├── config/
│   └── database.js           # Cấu hình kết nối MongoDB
├── controllers/
│   └── userController.js      # Xử lý logic cho user
├── middleware/
│   └── authMiddleware.js     # Middleware xác thực JWT
├── models/
│   ├── User.js               # Model cho User (collection: auth)
│   └── UserProfile.js        # Model cho UserProfile (collection: profile)
├── routes/
│   ├── authRoutes.js         # Routes cho authentication
│   └── userRoutes.js         # Routes cho user management
├── index.js                  # Entry point
├── package.json
└── .env                      # Environment variables
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` trong thư mục backend:
```env
PORT=5000
MONGO_DB_URI=mongodb://localhost:27017/chatty
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

3. Khởi động server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Đăng nhập admin
- `GET /api/admin/profile` - Lấy thông tin admin (cần token)

### User Management (cần token)
- `GET /api/users` - Lấy danh sách tất cả users
- `GET /api/users/stats` - Lấy thống kê users
- `GET /api/users/:id` - Lấy thông tin chi tiết một user

## Công nghệ sử dụng

- **Node.js** + **Express** - Web framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

