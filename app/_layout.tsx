// app/_layout.js (hoặc _layout.tsx)
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { WishlistProvider } from "../context/WishlistContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  AntDesign,
} from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../utils/notifications";

export default function RootLayout() {
  useEffect(() => {
    Ionicons.loadFont();
    MaterialCommunityIcons.loadFont();
    FontAwesome.loadFont();
    AntDesign.loadFont();
  }, []);

  useEffect(() => {
    const setupPush = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;
        const userId = user?._id || user?.id;
        if (userId) {
          await registerForPushNotificationsAsync(userId);
        }
      } catch (e) {
        console.error('Failed to register push notifications', e);
      }
    };
    setupPush();
  }, []);

  return (
    <ThemeProvider>
      <WishlistProvider>
        <SafeAreaProvider>
          <ThemedRoot />
        </SafeAreaProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}

function ThemedRoot() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
      <StripeProvider
        publishableKey="pk_test_51RgeVG4drE7VMTu3y19cSIlHqr0RqAlwpr0IsCm5dgw6wKyWbPRAL1JdyHvq1kKOX1zn1Pcx3ja16OoYERv2pxWT00ZODfs9px"
        merchantIdentifier="merchant.com.yourapp"
      >
        <Stack
          screenOptions={{
            headerShown: false, // tắt hết header mặc định
          }}
        />
      </StripeProvider>
      <Toast />
    </SafeAreaView>
  );
}

