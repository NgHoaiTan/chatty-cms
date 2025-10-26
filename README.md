# Chatty CMS - Social Media Admin Panel

Hệ thống quản trị cho trang mạng xã hội.

## Tính năng

- Đăng nhập Admin bằng email và mật khẩu
- Không có đăng ký - chỉ có tài khoản được cấp sẵn
- Dashboard quản trị với thống kê
- Bảo mật bằng JWT token

## Cài đặt và chạy

### Backend

1. Vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` trong thư mục backend:
```env
PORT=5000
MONGO_DB_URI=mongodb://localhost:27017/chatty
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

**Lưu ý:** Thay thế `MONGO_DB_URI` bằng MongoDB connection string thực tế của bạn.

4. Chạy backend:
```bash
npm start
```

Backend sẽ chạy tại: http://localhost:5000

### Frontend

1. Vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies (nếu chưa cài):
```bash
npm install
```

3. Chạy frontend:
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## Tài khoản Admin

**Email:** admin@chatty.com  
**Mật khẩu:** admin123

## Cấu trúc dự án

```
chatty-cms/
├── backend/          # Backend API (Node.js + Express)
│   ├── index.js     # Server chính
│   └── package.json
├── frontend/         # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx      # Trang đăng nhập
│   │   │   └── Dashboard.jsx  # Trang dashboard admin
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### POST /api/admin/login
Đăng nhập admin

**Request:**
```json
{
  "email": "admin@chatty.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "admin": {
    "id": 1,
    "email": "admin@chatty.com",
    "name": "Admin User"
  }
}
```

### GET /api/admin/profile
Lấy thông tin admin (cần token)

**Headers:**
```
Authorization: Bearer <token>
```

### GET /api/users/stats (cần token)
Lấy thống kê người dùng

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 6,
    "activeUsers": 3,
    "inactiveUsers": 3,
    "totalPosts": 4,
    "totalFollowers": 2,
    "totalFollowing": 2
  }
}
```

### GET /api/users (cần token)
Lấy danh sách tất cả users

**Response:**
```json
{
  "success": true,
  "count": 6,
  "users": [...]
}
```

### GET /api/users/:id (cần token)
Lấy thông tin chi tiết một user

## Công nghệ sử dụng

### Backend:
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend:
- **React** - UI framework
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Cấu trúc Backend (MVC Pattern)

Backend được tách cấu trúc rõ ràng theo MVC pattern:

```
backend/
├── config/           # Cấu hình (database, etc.)
├── controllers/      # Business logic
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Middleware functions
└── index.js         # Entry point
```

## Tính năng

✅ Đăng nhập Admin (JWT authentication)  
✅ Dashboard với thống kê thực tế từ MongoDB  
✅ Quản lý người dùng (xem danh sách và chi tiết)  
✅ Bảo vệ routes bằng JWT middleware  
✅ Kết nối MongoDB để lấy dữ liệu thực tế  
✅ UI hiện đại với Tailwind CSS  
✅ Responsive design

