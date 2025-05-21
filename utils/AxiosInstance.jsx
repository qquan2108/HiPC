// utils/axiosInstance.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tạo instance
const axiosInstance = axios.create({
  baseURL: 'http://192.168.10.19:5000', // Hoặc IP LAN nếu dùng thiết bị thật
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

export default axiosInstance;
