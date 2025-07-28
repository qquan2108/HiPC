import { View, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
const { width } = Dimensions.get("window");

export default function SkeletonCart() {
  return (
    <SkeletonPlaceholder borderRadius={10}>
      <View style={{ padding: 18 }}>
        {/* Header */}
        <View style={{ width: width - 36, height: 36, borderRadius: 12, marginBottom: 18 }} />
        {/* Địa chỉ */}
        <View style={{ width: width - 36, height: 40, borderRadius: 12, marginBottom: 18 }} />
        {/* Danh sách sản phẩm */}
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ width: width - 36, height: 90, borderRadius: 14, marginBottom: 14 }} />
        ))}
        {/* Tổng tiền */}
        <View style={{ width: width - 36, height: 48, borderRadius: 14, marginTop: 18 }} />
        {/* Thanh toán */}
        <View style={{ width: width - 36, height: 48, borderRadius: 14, marginTop: 14 }} />
      </View>
    </SkeletonPlaceholder>
  );
}