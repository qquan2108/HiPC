// components/Profile.js
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../utils/AxiosInstance";

// Base URL khớp với axiosInstance.defaults.baseURL
const API_BASE_URL =
  Constants.manifest?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  axiosInstance.defaults.baseURL;

// dựng nguồn ảnh (absolute hoặc relative)
function computeSource(uri, fallback) {
  if (!uri) return fallback;
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return { uri };
  }
  return {
    uri:
      API_BASE_URL.replace(/\/$/, "") +
      "/" +
      uri.replace(/^\/+/, ""),
  };
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // mỗi khi vào Profile, lấy token + storedUser, rồi fetch API /users/:id
 useFocusEffect(
  useCallback(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (!token) {
        setShowLoginDialog(true);
        return;
      }
      AsyncStorage.getItem("user").then((userStr) => {
        if (!userStr || userStr === "undefined") {
          setShowLoginDialog(true);
          return;
        }

        let stored;
        try {
          stored = JSON.parse(userStr);
        } catch (e) {
          console.error("Lỗi parse user từ AsyncStorage:", e);
          setShowLoginDialog(true);
          return;
        }

        const userId = stored.id || stored._id;
        if (!userId) {
          setShowLoginDialog(true);
          return;
        }

        axiosInstance
          .get(`/users/${userId}`)
          .then((res) => {
            setUser(res.data);
            setShowLoginDialog(false);
          })
          .catch((err) => {
            console.error(err);
            Alert.alert("Lỗi", "Không tải được thông tin người dùng");
          });
      });
    });
  }, [])
);


  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    router.replace("./LoginScreen");
  };

  return (
    <>
      {/* Nếu chưa login */}
      {showLoginDialog && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowLoginDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalEmoji}>😺</Text>
              <Text style={styles.modalTitle}>Bạn chưa đăng nhập!</Text>
              <Text style={styles.modalMessage}>
                Hãy đăng nhập để sử dụng đầy đủ chức năng của ứng dụng nhé!
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={() => {
                    setShowLoginDialog(false);
                    router.replace("./LoginScreen");
                  }}
                >
                  <Text style={styles.btnTextWhite}>Đăng nhập ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => {
                    setShowLoginDialog(false);
                    router.replace("/HomeScreen"); // Chuyển về trang HomeScreen
                  }}
                >
                  <Text style={styles.btnTextPrimary}>Để sau</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Loading */}
      {!user && !showLoginDialog && (
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      )}

      {/* Nội dung profile */}
      {user && (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#1976ff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hồ sơ của tôi</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={computeSource(
                user.avatarUrl,
                require("../assets/images/avatar.png")
              )}
              style={styles.avatar}
            />
            <Text style={styles.name}>{user.full_name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          {/* Menu */}
          <View style={styles.menu}>
            {[
              {
                icon: <Feather name="user" size={22} color="#1976ff" />,
                label: "Thông tin cá nhân",
                onPress: () => router.push("./UserInfo"),
              },
              {
                icon: <Feather name="heart" size={22} color="#1976ff" />,
                label: "Yêu thích",
                onPress: () => router.push("./favorite"),
              },
              {
                icon: <Feather name="credit-card" size={22} color="#1976ff" />,
                label: "Phương thức thanh toán",
                onPress: () => {},
              },
              {
                icon: <Feather name="package" size={22} color="#1976ff" />,
                label: "Theo dõi đơn hàng",
                onPress: () => router.push("./donhang"),
              },
              
              {
                icon: (
                  <Ionicons
                    name="ticket-outline"
                    size={22}
                    color="#1976ff"
                  />
                ),
                label: "voucher",
                onPress: () => router.push("./VoucherList"),
              },
              {
                icon: <Feather name="youtube" size={22} color="#1976ff" />,
                label: "Video",
                onPress: () => router.push("./livevideo"),
              },
              {
                icon: (
                  <Feather name="help-circle" size={22} color="#1976ff" />
                ),
                label: "Chăm sóc khách hàng",
                onPress: () => router.push("./danhmucall"),
              },
              {
                icon: (
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#1976ff"
                  />
                ),
                label: "Chính sách bảo mật",
                onPress: () => router.push("./"),
              },
              {
                icon: <Feather name="log-out" size={22} color="#1976ff" />,
                label: "Đăng xuất",
                onPress: handleLogout,
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>{item.icon}</View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={20} color="#b0b9c8" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    flexGrow: 1,
    paddingTop: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#1976ff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    width: 350,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    color: "#222",
    textAlign: "center",
  },
  modalMessage: {
    color: "#444",
    textAlign: "center",
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    gap: 8, // Nếu chưa hỗ trợ gap thì giữ marginHorizontal cho btn
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 0,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: "#2979ff" },
  btnSecondary: { backgroundColor: "#f0f4fa" },
  btnTextWhite: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  btnTextPrimary: { color: "#2979ff", fontWeight: "bold", fontSize: 16 },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
    backgroundColor: "#eaf2ff",
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 4,
  },
  email: {
    color: "#888",
    marginBottom: 8,
  },
  menu: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4fa",
    backgroundColor: "#fff",
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eaf2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
});
