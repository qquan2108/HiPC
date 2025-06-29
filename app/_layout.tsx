// app/_layout.js (hoặc _layout.tsx)
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { WishlistProvider } from "../context/WishlistContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <WishlistProvider>
      <SafeAreaProvider>
        {/* SafeAreaView sẽ tự động padding bên trên để khỏi bị che */}
        <SafeAreaView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,  // tắt hết header mặc định
            }}
          />
          <Toast />
        </SafeAreaView>
      </SafeAreaProvider>
    </WishlistProvider>
  );
}
