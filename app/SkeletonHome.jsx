import { Dimensions, View } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
const { width } = Dimensions.get("window");

export default function SkeletonHome() {
  return (
    <SkeletonPlaceholder borderRadius={8}>
      <View style={{ margin: 16 }}>
        {/* Banner */}
        <View style={{ width: width - 32, height: 120, borderRadius: 18, marginBottom: 18 }} />
        {/* Danh mục */}
        <View style={{ flexDirection: "row", marginBottom: 18 }}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }} />
          ))}
        </View>
        {/* Flash sale */}
        <View style={{ height: 28, width: 120, marginBottom: 10 }} />
        <View style={{ flexDirection: "row", marginBottom: 18 }}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={{ width: 110, height: 150, borderRadius: 12, marginRight: 12 }} />
          ))}
        </View>
        {/* Sản phẩm gợi ý */}
        <View style={{ height: 28, width: 180, marginBottom: 10 }} />
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ width: width - 32, height: 90, borderRadius: 12, marginBottom: 14 }} />
        ))}
      </View>
    </SkeletonPlaceholder>
  );
}