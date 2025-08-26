# HiPC - E-Commerce Platform for PC Hardware

HiPC là một nền tảng thương mại điện tử chuyên biệt cho **linh kiện và PC**, được phát triển bằng **React Native (Expo Router)** cho mobile app và **Express.js + MongoDB** cho backend.  
Dự án hướng đến trải nghiệm hiện đại, cá nhân hoá và tiện lợi cho người dùng Việt Nam.

## 🚀 Tính năng chính

- 🔑 **Xác thực & Quản lý tài khoản**: đăng ký, đăng nhập, quên mật khẩu, quản lý thông tin người dùng.  
- 🛒 **Mua sắm & Giỏ hàng**: thêm sản phẩm, quản lý biến thể, combo, flash sale, wishlist.  
- 🖥️ **Build PC thông minh**: chọn linh kiện theo danh mục (CPU, GPU, RAM…), kiểm tra tương thích, tính hiệu năng.  
- 🎁 **Ưu đãi & Voucher**: mã giảm giá theo % hoặc số tiền, giới hạn số lượng & thời gian.  
- 📦 **Thanh toán & Giao hàng**: tích hợp **VNPAY** & **Stripe**, hỗ trợ giao hàng nhanh với GHN API.  
- 🔔 **Thông báo đẩy (Push Notifications)**: cập nhật đơn hàng, ưu đãi, nhắc nhở.  
- ⭐ **Đánh giá & Bình luận**: người dùng để lại review, chấm sao, kèm hình ảnh.  
- 📊 **Quản trị (Admin Dashboard)**: quản lý sản phẩm, danh mục, thương hiệu, đơn hàng, voucher… (Handlebars + Express).  

## 🛠️ Công nghệ sử dụng

### Frontend (Mobile)
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)  
- [Expo Router](https://expo.github.io/router/)  
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)  
- [Axios](https://axios-http.com/)  
- [Lottie](https://lottiefiles.com/) animations  
- UI: LinearGradient, Ionicons, MaterialIcons, Skeleton loading  

### Backend
- [Express.js](https://expressjs.com/)  
- [MongoDB + Mongoose](https://mongoosejs.com/)  
- [PM2](https://pm2.keymetrics.io/) để quản lý tiến trình  
- Tích hợp GHN (Giao Hàng Nhanh) API, VNPAY, Stripe  

### DevOps & Quản trị
- Admin web: Handlebars (HBS)  
- Telegram bot: điều khiển server (pm2 start/restart/log)  
- GitHub Webhooks auto-deploy  

## 📱 Screenshots

*(Thêm ảnh màn hình demo app/web tại đây)*

## ⚡ Cài đặt

### 1. Mobile App (React Native - Expo)
```bash
# clone repo
git clone https://github.com/<your-username>/hipc.git
cd hipc

# cài dependencies
npm install

# chạy ứng dụng
npx expo start
```

### 2. Backend (Express.js)
```bash
cd server
npm install
npm run dev
```

## 📖 Cấu trúc thư mục chính

```
app/                # Mobile app (React Native + Expo)
compoment*/         # Các component theo module (Cart, CTSP, Home, Pay...)
utils/              # Axios, API helpers, notifications
server/             # Backend Express.js + MongoDB (API, models, routes)
views/              # Admin dashboard (Handlebars)
```

## 👤 Tác giả
- **Nhóm Road to GT - Dự án tốt nghiệp** K19.3
- **Thành viên:**
- Nguyễn Lê Phương Anh
- Võ Quốc Anh
- Lê Hữu Nhân
- Hà Văn Hiệp
- Lê Hữu Tình
- Triệu Văn Quốc Quân
