import { View, Dimensions } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
const { width, height } = Dimensions.get("window");

export default function SkeletonLiveVideo() {
  return (
    <SkeletonPlaceholder borderRadius={8}>
      <View style={{ width, height, backgroundColor: "#222" }}>
        {/* Video khung */}
        <View style={{ width, height: height * 0.6 }} />
        {/* Combo section */}
        <View style={{ position: "absolute", bottom: 32, left: 16, width: width * 0.56, height: height / 3.2, borderRadius: 14 }} />
        {/* User row */}
        <View style={{ position: "absolute", bottom: height / 3, left: 16, width: 120, height: 32, borderRadius: 16 }} />
      </View>
    </SkeletonPlaceholder>
  );
}