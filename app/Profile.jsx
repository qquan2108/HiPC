// components/Profile.js
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
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
  StatusBar,
  Platform,
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
      <StatusBar barStyle="light-content" backgroundColor="#1976ff" />
      
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
                    router.replace("/HomeScreen");
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
        <ScrollView style={styles.container}>
          {/* Enhanced Header với Gradient Background */}
          <View style={styles.headerContainer}>
            {/* Background Gradient Effect */}
            <View style={styles.headerBackground} />
            
            {/* Header Content */}
            <View style={styles.headerContent}>
              {/* Top Navigation Bar */}
              <View style={styles.topNavBar}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => router.back()}
                >
                  <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Hồ sơ</Text>
                
                <View style={styles.rightActions}>
                  <TouchableOpacity style={styles.navButton}>
                    <Feather name="more-vertical" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* User Info Section */}
              <View style={styles.userInfoSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={computeSource(
                        user.avatarUrl,
                        require("../assets/images/avatar.png")
                      )}
                      style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.editAvatarButton}>
                      <MaterialIcons name="photo-camera" size={16} color="#1976ff" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.full_name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    
                    {/* Status Badge */}
                    <View style={styles.statusBadge}>
                      <View style={styles.onlineIndicator} />
                      <Text style={styles.statusText}>Đang hoạt động</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryActionButton]}
                    onPress={() => router.push("./UserInfo")}
                  >
                    <Feather name="edit-3" size={16} color="#1976ff" />
                    <Text style={styles.primaryActionText}>Chỉnh sửa</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.secondaryActionButton]}
                    onPress={() => router.push("./settings")}
                  >
                    <Feather name="settings" size={16} color="#fff" />
                    <Text style={styles.secondaryActionText}>Cài đặt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
                onPress: () => router.push("./buildpc"),
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
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  
  // Enhanced Header Styles
  headerContainer: {
    position: "relative",
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1976ff",
    // Gradient effect simulation
    shadowColor: "#1976ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    position: "relative",
    paddingBottom: 20,
  },
  topNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: "row",
  },
  
  // User Info Section
  userInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "#fff",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1976ff",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4caf50",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionButton: {
    backgroundColor: "#fff",
  },
  secondaryActionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  primaryActionText: {
    color: "#1976ff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryActionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  // Menu Styles
  menuScrollView: {
    flex: 1,
    marginTop: 8,
  },
  menu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    minHeight: "100%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4fa",
    backgroundColor: "#fff",
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: "#ff4757",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Modal Styles (unchanged)
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
    gap: 8,
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
});