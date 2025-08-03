import { View, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
const { width } = Dimensions.get("window");

export default function SkeletonBuildPC() {
  return (
    <SkeletonPlaceholder borderRadius={10}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ width: width - 40, height: 40, borderRadius: 12, marginBottom: 18 }} />
        {/* Progress bar */}
        <View style={{ width: width - 40, height: 12, borderRadius: 6, marginBottom: 18 }} />
        {/* Build type scroll */}
        <View style={{ flexDirection: "row", marginBottom: 18 }}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={{ width: 120, height: 80, borderRadius: 16, marginRight: 12 }} />
          ))}
        </View>
        {/* Price summary */}
        <View style={{ width: width - 40, height: 36, borderRadius: 10, marginBottom: 18 }} />
        {/* Category list */}
        {[...Array(4)].map((_, i) => (
          <View key={i} style={{ width: width - 40, height: 70, borderRadius: 14, marginBottom: 14 }} />
        ))}
        {/* Action button */}
        <View style={{ width: width - 40, height: 48, borderRadius: 16, marginTop: 18 }} />
      </View>
    </SkeletonPlaceholder>
  );
}