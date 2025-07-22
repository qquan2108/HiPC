import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


function formatCurrency(num) {
  if (typeof num !== "number" || isNaN(num)) return "0 đ";
  return num.toLocaleString("vi-VN") + " đ";
}

export default function CheckoutSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const products = params.products ? JSON.parse(params.products) : [];
  const total = params.total;
  const address = params.address;
  const orderId = params.orderId;
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN");
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  // Animation values
  const tickScale = useRef(new Animated.Value(0)).current;
  const tickRotate = useRef(new Animated.Value(0)).current;
  const circlePulse = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const productItemOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Tick animation - bounce in with rotation
      Animated.parallel([
        Animated.spring(tickScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 100,
        }),
        Animated.timing(tickRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1.5),
          useNativeDriver: true,
        }),
      ]),
      // Circle pulse effect
      Animated.timing(circlePulse, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Content fade in
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Product items fade in
      Animated.timing(productItemOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Buttons bounce in
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotateInterpolate = tickRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-30deg", "0deg"],
  });

  const pulseInterpolate = circlePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const pulseOpacity = circlePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#f9f9f9', '#eaf3ff']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Success icon with animations */}
        <View style={styles.iconContainer}>
          {/* Pulse circle */}
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseInterpolate }],
                opacity: pulseOpacity,
              }
            ]}
          />

          {/* Check icon */}
          <Animated.View
            style={[
              styles.iconCircle,
              {
                transform: [
                  { scale: tickScale },
                  { rotate: rotateInterpolate },
                ],
              }
            ]}
          >
            <Feather name="check" size={48} color="#fff" />
          </Animated.View>
        </View>

        {/* Main content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }
          ]}
        >
          <Text style={styles.title}>Đặt hàng thành công!</Text>
          <Text style={styles.subtitle}>Cảm ơn bạn đã mua hàng tại HiPC</Text>
          
          {/* Order summary card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderText}>Thông tin đơn hàng</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đơn hàng</Text>
              <Text style={styles.infoValue}>{orderId || "Đang cập nhật"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Địa chỉ giao hàng</Text>
              <Text style={styles.infoValue}>{address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày đặt</Text>
              <Text style={styles.infoValue}>{dateStr} {timeStr}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.totalLabel}>Tổng tiền</Text>
              <Text style={styles.total}>{formatCurrency(Number(total))}</Text>
            </View>
          </View>

          <View style={{ flex: 1, width: "100%" }}>
            {/* Products list */}
            <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
            <Animated.View style={{ opacity: productItemOpacity, width: '100%', flex: 1 }}>
              <FlatList
                data={products}
                keyExtractor={(item, idx) => (item.id ? item.id.toString() : "item-") + idx}
                renderItem={({ item, index }) => (
                  <Animated.View 
                    style={[
                      styles.productCard,
                      {
                        opacity: productItemOpacity,
                        transform: [{
                          translateY: productItemOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 * (index + 1), 0],
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.productQty}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                  </Animated.View>
                )}
                style={{ marginBottom: 24 }}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 180 }}
              />
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action buttons - LUÔN ở cuối trang */}
      <Animated.View
        style={[
          styles.buttonRow,
          {
            transform: [{ scale: buttonScale }],
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f9f9f9',
            paddingTop: 16,
            paddingBottom: 32,
            paddingHorizontal: 24,
          }
        ]}
        pointerEvents="box-none"
      >


      </Animated.View>
      
              <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/donhang")}
          activeOpacity={0.85}
        >
          <View style={styles.primaryBtnBlue}>
            <Feather name="truck" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnBlueText}>Theo dõi đơn hàng</Text>
          </View>
        </TouchableOpacity>
                <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/HomeScreen")}
          activeOpacity={0.85}
        >
          <Feather name="home" size={20} color="#2563eb" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 0, // Không cần paddingBottom ở đây
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    height: 120,
  },
  pulseCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2ecc71",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2ecc71",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  content: {
    width: "100%",
    paddingBottom: 240, 
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#636e72",
    marginBottom: 32,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
    paddingBottom: 12,
    marginBottom: 12,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#636e72",
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: "#2d3436",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f2f6",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: "#2d3436",
    fontWeight: "600",
  },
  total: {
    fontSize: 20,
    color: "#e74c3c",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 16,
  },
  productCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productName: {
    fontSize: 15,
    color: "#2d3436",
    flex: 1,
    marginRight: 10,
  },
  productQty: {
    fontSize: 14,
    color: "#636e72",
    width: 30,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "600",
    minWidth: 100,
    textAlign: "right",
  },
  buttonRow: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 8,
    elevation: 0,
  },
  primaryBtnBlue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 24,
    width: "100%",
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnBlueText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#2563eb",
    marginTop: 0,
    elevation: 0,
  },
  secondaryBtnText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.2,
  },
});