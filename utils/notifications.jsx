// notifications.js (dùng cho .jsx/.js)
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import axiosInstance from './AxiosInstance';

// Hiển thị thông báo khi app đang foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(userId) {
  try {
    if (!Device.isDevice) return null;

    // Quyền thông báo
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    // Lấy Expo Push Token
    // Với SDK mới, nếu cần bạn có thể truyền { projectId: 'your-project-id' }
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    console.log("token noti: ", token)

    // Gửi token lên server
    await axiosInstance.post('/api/push/register-device', {
      userId,
      expoPushToken: token,
      platform: Platform.OS,
      appVersion: '1.0.0',
      locale: 'vi-VN',
    });

    // Lắng nghe khi người dùng bấm vào thông báo
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const url = resp?.notification?.request?.content?.data?.url;
      if (url) Linking.openURL(url);
    });

    // Trả về token và hàm hủy listener để gọi ở useEffect cleanup
    return { token, unsubscribe: () => sub.remove() };
  } catch (e) {
    console.warn('registerForPushNotificationsAsync error:', e?.message || e);
    return null;
  }
}
