import { Image, StyleSheet } from "react-native";

export default function ProductImage({ images }) {
  // Log để debug
  console.log("ProductImage nhận images:", images);

  // Lấy ảnh đầu tiên, fallback ảnh mặc định nếu không có
  const source =
    images && images.length > 0
      ? images[0]
      : require("../assets/images/pc1.png");

  return <Image source={source} style={styles.productImage} />;
}

const styles = StyleSheet.create({
  productImage: {
    width: "92%",
    height: 220,
    backgroundColor: "#f5f6fa",
    resizeMode: "cover",
    borderRadius: 18,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});