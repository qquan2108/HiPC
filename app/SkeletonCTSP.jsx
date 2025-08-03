import { View, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
const { width } = Dimensions.get("window");

export default function SkeletonCTSP() {
  return (
    <SkeletonPlaceholder borderRadius={10}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ width: width - 32, height: 36, borderRadius: 12, marginBottom: 18 }} />
        {/* Ảnh sản phẩm */}
        <View style={{ width: width - 32, height: 220, borderRadius: 18, marginBottom: 18 }} />
        {/* Tên sản phẩm */}
        <View style={{ width: width - 80, height: 28, borderRadius: 8, marginBottom: 10 }} />
        {/* Meta */}
        <View style={{ width: width - 120, height: 18, borderRadius: 8, marginBottom: 10 }} />
        {/* Giá */}
        <View style={{ width: 120, height: 28, borderRadius: 8, marginBottom: 18 }} />
        {/* Option/variant */}
        <View style={{ width: width - 32, height: 40, borderRadius: 10, marginBottom: 18 }} />
        {/* Mô tả */}
        <View style={{ width: width - 32, height: 60, borderRadius: 10, marginBottom: 18 }} />
        {/* Specs */}
        <View style={{ width: width - 32, height: 40, borderRadius: 10, marginBottom: 18 }} />
        {/* Nút mua */}
        <View style={{ width: width - 32, height: 48, borderRadius: 14, marginTop: 18 }} />
      </View>
    </SkeletonPlaceholder>
  );
}