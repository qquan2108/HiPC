// app/_layout.js (hoặc _layout.tsx)
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { WishlistProvider } from "../context/WishlistContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  AntDesign,
} from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function RootLayout() {
  useEffect(() => {
    Ionicons.loadFont();
    MaterialCommunityIcons.loadFont();
    FontAwesome.loadFont();
    AntDesign.loadFont();
  }, []);
  return (
    <WishlistProvider>
      <SafeAreaProvider>
        {/* SafeAreaView sẽ tự động padding bên trên để khỏi bị che */}
        <SafeAreaView style={{ flex: 1 }}>
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
      </SafeAreaProvider>
    </WishlistProvider>
  );
}

