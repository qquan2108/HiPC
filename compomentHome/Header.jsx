import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default function Header({ router }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const searchScaleAnim = useRef(new Animated.Value(1)).current;
  const searchWidthAnim = useRef(new Animated.Value(1)).current;
  const avatarScaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Notification badge animation
  const badgeScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Notification badge pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgeScaleAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle pulse animation for avatar
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.parallel([
      Animated.timing(searchScaleAnim, {
        toValue: 1.02,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(searchWidthAnim, {
        toValue: 1.05,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.parallel([
      Animated.timing(searchScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(searchWidthAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.timing(avatarScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(avatarScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    router.push("./Profile");
  };

  const handleIconPress = (callback) => {
    Animated.sequence([
      Animated.timing(iconScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback && callback();
  };

  const AnimatedIcon = ({ name, size, color, onPress, showBadge = false, library = "Feather" }) => {
    const IconComponent = library === "Feather" ? Feather : MaterialCommunityIcons;
    
    return (
      <TouchableOpacity
        onPress={() => handleIconPress(onPress)}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: iconScaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(26, 115, 232, 0.1)', 'rgba(26, 115, 232, 0.05)']}
            style={styles.iconGradient}
          >
            <IconComponent name={name} size={size} color={color} />
          </LinearGradient>
          {showBadge && (
            <Animated.View
              style={[
                styles.notificationBadge,
                {
                  transform: [{ scale: badgeScaleAnim }],
                },
              ]}
            >
              <Text style={styles.badgeText}>3</Text>
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Main Header Content */}
      <BlurView intensity={95} tint="light" style={styles.headerBlur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            {/* Avatar Section */}
            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={0.8}
              style={styles.avatarSection}
            >
              <Animated.View
                style={[
                  styles.avatarContainer,
                  {
                    transform: [
                      { scale: Animated.multiply(avatarScaleAnim, pulseAnim) }
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.avatarGradient}
                >
                  <Image
                    source={require("../assets/images/avatar.png")}
                    style={styles.avatar}
                  />
                </LinearGradient>
                <View style={styles.onlineIndicator} />
              </Animated.View>
            </TouchableOpacity>

            {/* Quick Actions Section - thay cho thanh tìm kiếm */}
            <View style={styles.quickActionsBar}>
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => router.push("./bolocdanhmuc")}
                activeOpacity={0.8}
              >
                <Feather name="filter" size={18} color="#667eea" />
                <Text style={styles.quickActionText}>Lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <Feather name="facebook" size={18} color="#667eea" />
                <Text style={styles.quickActionText}>Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => router.push("./thongbao")}
                activeOpacity={0.8}
              >
                <Feather name="bell" size={18} color="#667eea" />
                <View style={styles.quickActionTextWrap}>
                  <Text style={styles.quickActionText}>Thông{"\n"}báo</Text>
                </View>
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeDotText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    zIndex: 1000,
  },
  headerBlur: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },

  // Avatar Styles
  avatarSection: {
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  // Quick Actions Styles
  quickActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    gap: 12, // thêm khoảng cách đều giữa các ô
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 231, 235, 0.5)',
    minHeight: 54,
    minWidth: 0,
    marginHorizontal: 0,
    gap: 8,
    position: 'relative',
  },
  quickActionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  quickActionTextWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeDotText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});