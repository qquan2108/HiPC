import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
export default function ReviewBox() {
  const router = useRouter();
  return (
    <View style={styles.reviewBox}>
      <Text style={styles.reviewLabel}>Đánh giá và nhận xét</Text>
      <View style={styles.reviewRow}>
        <Text style={styles.reviewStars}>★★★★★</Text>
        <Text style={styles.reviewScore}>4.5</Text>
        <Image
          source={require("../assets/images/pc1.png")}
          style={styles.reviewAvatar}
        />
        <Text style={styles.reviewUser}>thitit.ba</Text>
      </View>
      <Text style={styles.reviewComment}>Sản phẩm chất lượng xứng đáng số tiền bỏ ra</Text>
      <TouchableOpacity style={styles.reviewBtn}onPress={() => router.push("./danhgia")}>
        <Text style={styles.reviewBtnText}>Xem tất cả đánh giá</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  reviewLabel: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    justifyContent: "center",
  },
  reviewStars: {
    color: "#fbc02d",
    fontSize: 18,
    marginRight: 4,
  },
  reviewScore: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 8,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reviewUser: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 14,
  },
  reviewComment: {
    color: "#444",
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 2,
    textAlign: "center",
  },
  reviewBtn: {
    backgroundColor: "#2979ff",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
    marginHorizontal: 40,
  },
  reviewBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});