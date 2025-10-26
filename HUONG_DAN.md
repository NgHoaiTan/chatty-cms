# Hướng dẫn sử dụng Chatty CMS Admin Panel

## Cài đặt và chạy dự án

### Bước 1: Khởi động Backend

1. Mở terminal/PowerShell và điều hướng đến thư mục backend:
```bash
cd backend
```

2. Cài đặt các package cần thiết (nếu chưa cài):
```bash
npm install
```

3. Tạo file `.env` trong thư mục backend với nội dung sau:
```env
PORT=5000
MONGO_DB_URI=mongodb://localhost:27017/chatty
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

**Lưu ý:** Thay thế `MONGO_DB_URI` bằng MongoDB connection string thực tế của bạn (ví dụ: mongodb atlas URI).

4. Khởi động server backend:
```bash
npm start
```

Backend sẽ chạy tại: http://localhost:5000

### Bước 2: Khởi động Frontend

1. Mở terminal/PowerShell mới và điều hướng đến thư mục frontend:
```bash
cd frontend
```

2. Khởi động frontend:
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

### Bước 3: Đăng nhập

1. Mở trình duyệt và truy cập: http://localhost:5173
2. Bạn sẽ được chuyển đến trang đăng nhập
3. Sử dụng thông tin đăng nhập sau:

**Email:** admin@chatty.com  
**Mật khẩu:** admin123

4. Sau khi đăng nhập thành công, bạn sẽ được chuyển đến trang Dashboard admin

## Tính năng

### Trang đăng nhập (Login)
- Đăng nhập bằng email và mật khẩu
- Không có tính năng đăng ký
- Chỉ có tài khoản được cấp sẵn
- Hiển thị thông báo lỗi nếu đăng nhập sai

### Trang Dashboard
- Xem thông tin admin đang đăng nhập
- Xem thống kê tổng quan từ database thực tế:
  - Tổng số người dùng (active/inactive)
  - Tổng số bài viết từ tất cả users
  - Tổng số lượt theo dõi
- Nút "Quản lý người dùng" để vào trang danh sách users
- Nút đăng xuất để thoát khỏi hệ thống
- Bảo vệ bằng authentication - không thể truy cập nếu chưa đăng nhập

### Trang Quản lý Người dùng
- Xem danh sách tất cả users từ database
- Hiển thị thông tin: tên, email, posts count, followers, status
- Click vào user để xem chi tiết đầy đủ
- Modal hiển thị thông tin chi tiết user và profile

## API Endpoints

### POST /api/admin/login
Đăng nhập với email và mật khẩu

**Request body:**
```json
{
  "email": "admin@chatty.com",
  "password": "admin123"
}
```

**Response (success):**
```json
{
  "success": true,
  "token": "jwt-token-string",
  "admin": {
    "id": 1,
    "email": "admin@chatty.com",
    "name": "Admin User"
  }
}
```

### GET /api/admin/profile
Lấy thông tin admin (cần token để truy cập)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": 1,
    "email": "admin@chatty.com",
    "name": "Admin User"
  }
}
```

## Cấu trúc dự án

```
chatty-cms/
├── backend/
│   ├── config/
│   │   └── database.js       # Kết nối MongoDB
│   ├── controllers/
│   │   └── userController.js # Logic xử lý user
│   ├── middleware/
│   │   └── authMiddleware.js # JWT authentication
│   ├── models/
│   │   ├── User.js          # Model User (collection: auth)
│   │   └── UserProfile.js   # Model Profile (collection: profile)
│   ├── routes/
│   │   ├── authRoutes.js    # Routes đăng nhập
│   │   └── userRoutes.js    # Routes user management
│   ├── index.js             # Entry point
│   ├── package.json
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx     # Trang đăng nhập
│   │   │   ├── Dashboard.jsx # Trang dashboard
│   │   │   └── Users.jsx     # Trang quản lý users
│   │   ├── App.jsx           # Router chính
│   │   └── main.jsx          # Entry point
│   └── package.json
├── README.md
└── HUONG_DAN.md
```

## Công nghệ sử dụng

- **Backend:** Node.js, Express, JWT, bcrypt, CORS
- **Frontend:** React, React Router, Axios, Tailwind CSS, Vite

## Lưu ý

1. Đảm bảo MongoDB đang chạy hoặc kết nối được với MongoDB Atlas
2. Cập nhật `MONGO_DB_URI` trong file `.env` với connection string thực tế của bạn
3. Đảm bảo cả backend và frontend đều đang chạy để sử dụng đầy đủ tính năng
4. Token JWT có thời hạn 7 ngày
5. Mật khẩu được mã hóa bằng bcrypt
6. Backend đã được tách cấu trúc rõ ràng: routes, controllers, models, middleware, config

## Xử lý lỗi

- **Backend không chạy:** Đảm bảo backend đang chạy ở cổng 5000
- **Không đăng nhập được:** Kiểm tra email và mật khẩu đúng
- **Token hết hạn:** Đăng xuất và đăng nhập lại
- **Lỗi CORS:** Backend đã được cấu hình CORS để cho phép frontend truy cập

