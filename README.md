# HiPC Expo App

This repository contains a React Native application built with [Expo](https://expo.dev/).

## Setup

1. Install Node.js if you have not already.
2. Install project dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   # or
   npx expo start
   ```

Use the Expo CLI prompts to run the app on a simulator or physical device (e.g. with `--android`, `--ios` or web). For more details, see the [Expo documentation](https://docs.expo.dev/).

## Thanh toán qua VietQR

Trang `app/VietQRScreen.jsx` cho phép hiển thị QR Code động dùng dịch vụ [SePay](https://qr.sepay.vn). Truyền các tham số `acc`, `bank`, `amount` (tuỳ chọn) và `des` (tuỳ chọn) qua query trên đường dẫn để tạo mã QR. Ví dụ:

```
/VietQRScreen?acc=0010000000355&bank=Vietcombank&amount=100000&des=Ung%20ho
```

Ứng dụng sẽ hiển thị hình ảnh QR Code để người dùng quét bằng ứng dụng ngân hàng.
