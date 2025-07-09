import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../utils/AxiosInstance";  // <— dùng luôn baseURL từ đây

const SUGGESTIONS = ["PC", "Phụ kiện", "Linh kiện", "Gaming", "Laptop"];

export default function Header({
  router,
  notificationCount = 0,
  avatarUri = null,
}) {
  const insets = useSafeAreaInsets();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    const iv = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const onAvatarPress = () => {
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(avatarScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => router.push("./Profile"));
  };

  // Dùng luôn baseURL từ axiosInstance
  const base = axiosInstance.defaults.baseURL.replace(/\/$/, "");

 const buildSource = uri => {
    if (!uri) return require("../assets/images/avatar.png"); // avatar mặc định
    if (uri.startsWith("http")) return { uri };
    // ghép với baseURL: ví dụ base="http://localhost:3000", uri="uploads/xxx.jpg"
    return { uri: `${base}/${uri.replace(/^\/+/, "")}` };
  };

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: "transparent", zIndex: 1000 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <BlurView intensity={90} tint="light" style={styles.blur}>
        <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(248,250,252,0.9)"]} style={styles.gradient}>
          <View style={styles.row}>
            <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
              <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
                <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.avatarBg}>
                  <Image source={buildSource(avatarUri)} style={styles.avatar} />
                </LinearGradient>
                <View style={styles.onlineDot} />
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.searchContainer}>
              <Feather name="search" size={18} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder={SUGGESTIONS[placeholderIdx]}
                placeholderTextColor="#999"
                onFocus={() => router.push("./Searchscreen")}
              />
            </View>

            <TouchableOpacity onPress={() => router.push("./thongbao")} style={styles.notifyBtn} activeOpacity={0.7}>
              <Feather name="bell" size={24} color="#667eea" />
              {notificationCount > 0 && (
                <View style={styles.notifyBadge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blur: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: "hidden" },
  gradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { marginRight: 12 },
  avatarBg: { width: 48, height: 48, borderRadius: 24, padding: 2, justifyContent: "center", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#fff" },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f1f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14, color: "#333", paddingVertical: 0 },
  notifyBtn: { marginLeft: 16, padding: 6 },
  notifyBadge: { position: "absolute", top: 4, right: 2, backgroundColor: "#ef4444", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "600" },
});
