import { Image, StyleSheet, View } from "react-native";

export default function ProductImage({ images }) {
  console.log("ProductImage nhận images:", images);

  const source =
    images && images.length > 0
      ? images[0]
      : require("../assets/images/pc1.png");

  return (
    <View style={styles.wrapper}>
      <Image
        source={source}
        style={styles.productImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#f5f6fa",
    borderRadius: 18,
    alignSelf: "center",
    marginVertical: 10,
    overflow: "hidden",         // để borderRadius có tác dụng
  },
  productImage: {
    width: "100%",
    aspectRatio: 1.2,           // giữ tỉ lệ, bạn có thể chỉnh theo thực tế
  },
});
