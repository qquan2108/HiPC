import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { WishlistProvider } from "../context/WishlistContext";

export default function RootLayout() {
  return (
    <WishlistProvider>
      <>
        <Stack />
        <Toast />
      </>
    </WishlistProvider>
  );
}
