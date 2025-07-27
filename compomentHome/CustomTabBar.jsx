import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Feather ,MaterialCommunityIcons,FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

export default function CustomTabBar({ router }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.customTabBarContainer,
        { paddingBottom: insets.bottom }   // <-- sẽ được áp dụng
      ]}
    >
      <View style={styles.customTabBar}>
        <TouchableOpacity
          style={styles.tabItemCustom}
          onPress={() => router.push("/HomeScreen")}
        >
          <Feather name="home" size={22} color="#4a90e2" />
          <Text style={styles.tabLabelActive}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItemCustom}
          onPress={() => router.push("/livevideo")}
        >
          <Feather name="youtube" size={22} color="#4a90e2" />
          <Text style={styles.tabLabel}>Video Hot</Text>
        </TouchableOpacity>

        <View style={styles.tabCartWrapperCustom}>
          <TouchableOpacity
            style={styles.tabCartBtnCustom}
            onPress={() => router.push("/buildpc")}
          >
           <MaterialCommunityIcons name="desktop-classic" size={32} color="#4a90e2" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.tabItemCustom}
          onPress={() => router.push("/cart")}
        >
          <Feather name="shopping-cart" size={22} color="#4a90e2" />
          <Text style={styles.tabLabel}>Giỏ hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItemCustom}
          onPress={() => router.push("/Profile")}
        >
          <Feather name="settings" size={22} color="#4a90e2" />
          <Text style={styles.tabLabel}>Cài đặt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  customTabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "transparent", // đảm bảo vùng padding trong suốt
  },
  customTabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 40,
    height: 70,
    marginHorizontal: 18,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    width: width - 36,
  },
  tabItemCustom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    color: "#222",
    marginTop: 2,
  },
  tabLabelActive: {
    fontSize: 11,
    color: "#4a90e2",
    fontWeight: "bold",
    marginTop: 2,
  },
  tabCartWrapperCustom: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -32,
    shadowColor: "#f55858",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 20,
  },
  tabCartBtnCustom: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4a90e2",
  },
});
