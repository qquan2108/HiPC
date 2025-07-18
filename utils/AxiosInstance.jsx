// utils/axiosInstance.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const baseURL =
  Platform.OS === 'ios' || Platform.OS === 'android'
    ? 'http://192.168.10.19:3000' // IP LAN cho thiết bị thật
    : 'http://localhost:3000';      // Cho web hoặc máy tính

// Tạo instance
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Gắn token vào header trước mỗi request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(token)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const addToCart = async (product) => {
  try {
    // Kiểm tra đăng nhập
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.push('/LoginScreen');
      return;
    }
    // Nếu đã đăng nhập, thêm vào giỏ hàng như cũ
    await axiosInstance.post('/orders/add-to-cart', {
      productId: product.id,
      quantity: 1
    });
    Toast.show({
      type: 'success',
      text1: 'Đã thêm vào giỏ hàng!',
      text2: 'Bạn có thể kiểm tra trong giỏ hàng.',
      position: 'bottom',
      visibilityTime: 1200,
    });
    setTimeout(() => {
      router.push('./cart');
    }, 1200);
  } catch (err) {
    Toast.show({
      type: 'error',
      text1: 'Có lỗi khi thêm vào giỏ hàng!',
      text2: 'Vui lòng thử lại.',
      position: 'top',
      visibilityTime: 1800,
    });
    console.error(err);
  }
};

export default axiosInstance;
