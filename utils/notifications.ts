import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import axiosInstance from './AxiosInstance';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(userId: string) {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  await axiosInstance.post('/api/push/register-device', {
    userId,
    expoPushToken: token,
    platform: Platform.OS,
    appVersion: '1.0.0',
    locale: 'vi-VN',
  });

  Notifications.addNotificationResponseReceivedListener(resp => {
    const url = resp.notification.request.content.data?.url as string | undefined;
    if (url) Linking.openURL(url);
  });

  return token;
}
