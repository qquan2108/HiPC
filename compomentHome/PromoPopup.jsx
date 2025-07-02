import React from "react";
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome, AntDesign } from "@expo/vector-icons";

export default function PromoPopup({ visible, fadeAnim, onClose }) {
  if (!visible) return null;
  return (
    <Animated.View style={[styles.popupOverlay, { opacity: fadeAnim }]}>
      <View style={styles.popupContainer}>
        <View style={styles.popupHeader}>
          <Ionicons name="flash" size={28} color="#FFD700" />
          <Text style={styles.popupTitle}>DEAL SỐC HÔM NAY!</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <Image
          source={require("../assets/images/pcbanner.jpg")}
          style={styles.popupImage}
          resizeMode="contain"
        />
        <View style={styles.offerList}>
          <View style={styles.offerItem}>
            <MaterialCommunityIcons name="tag-text-outline" size={20} color="#FF3B30" />
            <Text style={styles.offerText}>
              Giảm tới <Text style={styles.highlightText}>50%</Text> PC Gaming
            </Text>
          </View>
          <View style={styles.offerItem}>
            <MaterialCommunityIcons name="gift-outline" size={20} color="#FF3B30" />
            <Text style={styles.offerText}>
              Tặng <Text style={styles.highlightText}>RAM 8GB</Text> khi mua Mainboard
            </Text>
          </View>
          <View style={styles.offerItem}>
            <FontAwesome name="clock-o" size={20} color="#FF3B30" />
            <Text style={styles.offerText}>
              Áp dụng đến <Text style={styles.highlightText}>23:59</Text> hôm nay
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>MUA NGAY - ƯU ĐÃI CÓ HẠN</Text>
          <AntDesign name="arrowright" size={18} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popupOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    overflow: "hidden",
    paddingBottom: 20,
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    position: "relative",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
    marginLeft: 8,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  popupImage: {
    width: "100%",
    height: 180,
  },
  offerList: {
    padding: 15,
  },
  offerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  offerText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
  },
  highlightText: {
    fontWeight: "bold",
    color: "#FF3B30",
  },
  ctaButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  ctaText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
