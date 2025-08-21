import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator // <-- Thêm dòng này
  ,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useWishlist } from '../context/WishlistContext';
import axiosInstance from "../utils/AxiosInstance";

const { width } = Dimensions.get('window');

export default function FavoriteScreen() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlist();

  // Thêm state kiểm tra đăng nhập
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Kiểm tra đăng nhập
  React.useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      if (!token) {
        setShowLoginDialog(true);
        setLoading(false);
        return;
      }
      AsyncStorage.getItem("user").then((userStr) => {
        if (!userStr || userStr === "undefined") {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        let stored;
        try {
          stored = JSON.parse(userStr);
        } catch (e) {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        const userId = stored.id || stored._id;
        if (!userId) {
          setShowLoginDialog(true);
          setLoading(false);
          return;
        }
        setShowLoginDialog(false);
        setLoading(false);
      });
    });
  }, []);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Header entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRemove = (id) => {
    removeFromWishlist(id);
  };

  const handleGoDetail = (id) => {
    router.push({ pathname: "/ctsp", params: { id } });
  };

  const handleAddToCart = async (item) => {
    try {
      await axiosInstance.post('/oders/add-to-cart', {
        productId: item.id,
        quantity: 1
      });
      Toast.show({
        type: 'success',
        text1: 'Đã thêm vào giỏ hàng!',
        position: 'bottom',
        visibilityTime: 1200,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi khi thêm vào giỏ hàng!',
        position: 'top',
        visibilityTime: 1800,
      });
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, index === 0 && styles.cardActive]}>
      <View style={styles.cardBody}>
        <Image source={item.image} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            )}
          </View>
          <Text style={styles.desc}>{item.desc}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.originalPrice}>{item.originalPrice}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.rating}>
              <AntDesign name="star" size={13} color="#1976ff" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <View style={styles.iconGroup}>
              <TouchableOpacity style={styles.iconCircle} onPress={() => handleGoDetail(item.id)}>
                <Ionicons name="information-circle-outline" size={18} color="#1976ff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle} onPress={() => handleAddToCart(item)}>
                <Feather name="shopping-cart" size={18} color="#1976ff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle} onPress={() => handleRemove(item.id)}>
                <Feather name="trash-2" size={18} color="#1976ff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  if (showLoginDialog) {
    return (
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
                setLoading(false);
                router.replace("/HomeScreen");
              }}
            >
              <Text style={styles.btnTextPrimary}>Để sau</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Animated.View style={{opacity:fadeAnim, transform:[{scale:scaleAnim}]}}>
          <ActivityIndicator size="large" color="#2979ff" />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      {/* MODERN ANIMATED HEADER */}
      <Animated.View 
        style={[
          styles.modernHeader,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Glass Background Effect */}
        <View style={styles.glassBackground} />
        
        {/* Header Content */}
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.modernBackButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.modernTitle}>Yêu Thích Của Tôi</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>{wishlist.length} items saved</Text>
          </View>
          
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={styles.actionButtonInner}>
              <Feather name="search" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </Animated.View>

      <FlatList
        data={wishlist}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 18, paddingBottom: 40, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  
  // ===== MODERN HEADER STYLES =====
  modernHeader: {
    height: Platform.OS === 'ios' ? 120 : 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    position: 'relative',
    overflow: 'hidden',
  },
  
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 118, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(25, 118, 255, 0.88)',
      },
    }),
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: '100%',
    position: 'relative',
    zIndex: 2,
  },
  
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  
  modernTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    textShadow: '0px 2px 4px rgba(0,0,0,0.3)',
  },
  
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 2,
    opacity: 0.8,
  },
  
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  actionButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  
  decorativeCircle2: {
    position: 'absolute',
    bottom: -25,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  
  // ===== CARD STYLES =====
  card: {
    backgroundColor: '#eaf2ff',
    borderRadius: 18,
    marginBottom: 18,
    padding: 12,
    shadowColor: '#1976ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  cardActive: {
    borderColor: '#1976ff',
    backgroundColor: '#f5faff',
  },
  
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 0,
    marginRight: 8,
    flexShrink: 1,
  },
  
  desc: {
    color: '#222',
    fontSize: 13,
    marginBottom: 4,
  },
  
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  price: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 8,
  },
  
  originalPrice: {
    fontSize: 13,
    color: '#b0b9c8',
    textDecorationLine: 'line-through',
  },
  
  discountBadge: {
    backgroundColor: 'red',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3edff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  
  ratingText: {
    color: '#1976ff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 3,
  },
  
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e3edff',
  },

  // ===== LOADING AND DIALOG STYLES =====
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8faff',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  
  dialogContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  
  dialogContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  
  dialogMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  dialogButton: {
    backgroundColor: '#1976ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  
  dialogButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // ===== MODAL STYLES =====
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
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