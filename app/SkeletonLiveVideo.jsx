import { View, Dimensions } from "react-native";
import { Skeleton } from "moti/skeleton";
const { width, height } = Dimensions.get("window");

export default function SkeletonLiveVideo() {
  return (
    <View style={{ width, height, backgroundColor: "#222" }}>
      {/* Video khung */}
      <Skeleton width={width} height={height * 0.6} />
      {/* Combo section */}
      <View style={{ position: "absolute", bottom: 32, left: 16 }}>
        <Skeleton width={width * 0.56} height={height / 3.2} radius={14} />
      </View>
      {/* User row */}
      <View style={{ position: "absolute", bottom: height / 3, left: 16 }}>
        <Skeleton width={120} height={32} radius={16} />
      </View>
    </View>
  );
}