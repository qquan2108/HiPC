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
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import axiosInstance from "../utils/AxiosInstance";

const { width } = Dimensions.get('window');
const SUGGESTIONS = [
  "Tìm kiếm sản phẩm...", 
  "Linh kiện máy tính", 
  "PC Gaming", 
  "Laptop văn phòng", 
  "Phụ kiện công nghệ"
];

export default function Header({
  router,
  notificationCount = 0,
  avatarUri = null,
  userName = "User",
}) {
  const insets = useSafeAreaInsets();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;
  const searchScale = useRef(new Animated.Value(1)).current;
  const notifyScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.spring(slideAnim, { 
        toValue: 0, 
        tension: 60, 
        friction: 8, 
        useNativeDriver: true 
      }),
    ]).start();

    // Placeholder rotation
    const placeholderInterval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % SUGGESTIONS.length);
    }, 4000);

    // Time update
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(placeholderInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const onAvatarPress = () => {
    Animated.sequence([
      Animated.timing(avatarScale, { 
        toValue: 0.85, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.spring(avatarScale, { 
        toValue: 1, 
        tension: 300, 
        friction: 4, 
        useNativeDriver: true 
      }),
    ]).start(() => router.push("./Profile"));
  };

  const onSearchPress = () => {
    Animated.sequence([
      Animated.timing(searchScale, { 
        toValue: 0.95, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(searchScale, { 
        toValue: 1, 
        duration: 100, 
        useNativeDriver: true 
      }),
    ]).start(() => router.push("./Searchscreen"));
  };

  const onNotificationPress = () => {
    Animated.sequence([
      Animated.timing(notifyScale, { 
        toValue: 0.8, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.spring(notifyScale, { 
        toValue: 1, 
        tension: 300, 
        friction: 4, 
        useNativeDriver: true 
      }),
    ]).start(() => router.push("./thongbao"));
  };

  const base = axiosInstance.defaults.baseURL.replace(/\/$/, "");

  const buildSource = uri => {
    if (!uri) return require("../assets/images/avatar.png");
    if (uri.startsWith("http")) return { uri };
    return { uri: `${base}/${uri.replace(/^\/+/, "")}` };
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.95)']}
        style={styles.backgroundGradient}
      />
      
      {/* Blur Effect */}
      <BlurView intensity={100} tint="light" style={styles.blurContainer}>
        <Animated.View 
          style={[
            styles.contentContainer, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {/* Top Row - Avatar and Notifications */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
              <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}>
                <LinearGradient 
                  colors={['#667eea', '#764ba2', '#f093fb']} 
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image source={buildSource(avatarUri)} style={styles.avatarImage} />
                </LinearGradient>
                <View style={styles.onlineIndicator} />
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.userNameText}>{userName}</Text>
            </View>

            <View style={styles.rightSection}>
              {/* Menu Button */}
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                <LinearGradient 
                  colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']} 
                  style={styles.iconGradient}
                >
                  <Feather name="menu" size={20} color="#667eea" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Notification Button */}
              <TouchableOpacity onPress={onNotificationPress} activeOpacity={0.7}>
                <Animated.View style={[styles.notificationContainer, { transform: [{ scale: notifyScale }] }]}>
                  <LinearGradient 
                    colors={notificationCount > 0 ? ['#ff6b6b', '#ee5a24'] : ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']} 
                    style={styles.iconGradient}
                  >
                    <Feather 
                      name="bell" 
                      size={20} 
                      color={notificationCount > 0 ? "#fff" : "#667eea"} 
                    />
                  </LinearGradient>
                  {notificationCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity onPress={onSearchPress} activeOpacity={0.8}>
            <Animated.View style={[styles.searchBarContainer, { transform: [{ scale: searchScale }] }]}>
              <LinearGradient 
                colors={['rgba(255,255,255,0.8)', 'rgba(248,250,252,0.9)']} 
                style={styles.searchBar}
              >
                <View style={styles.searchIconContainer}>
                  <LinearGradient 
                    colors={['#667eea', '#764ba2']} 
                    style={styles.searchIconGradient}
                  >
                    <Feather name="search" size={14} color="#fff" />
                  </LinearGradient>
                </View>
                
                <Text style={styles.searchPlaceholder}>
                  {SUGGESTIONS[placeholderIdx]}
                </Text>
                
                <View style={styles.searchActions}>
                  <TouchableOpacity style={styles.voiceButton} activeOpacity={0.7}>
                    <Feather name="mic" size={16} color="#667eea" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cameraButton} activeOpacity={0.7}>
                    <Feather name="camera" size={16} color="#667eea" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {[
              { icon: 'zap', label: 'Nhanh' },
              { icon: 'gift', label: 'Khuyến mãi' },
              { icon: 'star', label: 'Yêu thích' },
              { icon: 'help-circle', label: 'Hỗ trợ' }
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.quickActionButton} activeOpacity={0.7}>
                <LinearGradient 
                  colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']} 
                  style={styles.quickActionGradient}
                >
                  <Feather name={item.icon} size={14} color="#667eea" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  blurContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#10b981',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  greetingContainer: {
    flex: 1,
    marginLeft: 4,
  },
  greetingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 16,
  },
  userNameText: {
    fontSize: 17,
    color: '#1e293b',
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#ff3b30',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  searchBarContainer: {
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchIconGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    padding: 6,
  },
  cameraButton: {
    padding: 6,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quickActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});