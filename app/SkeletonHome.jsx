import { Dimensions, View } from "react-native";
import { Skeleton } from "moti/skeleton";
const { width } = Dimensions.get("window");

export default function SkeletonHome() {
  return (
    <View style={{ margin: 16 }}>
      {/* Banner */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton width={width - 32} height={120} radius={18} />
      </View>
      {/* Danh mục */}
      <View style={{ flexDirection: "row", marginBottom: 18 }}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ marginRight: 12 }}>
            <Skeleton width={60} height={60} radius={30} />
          </View>
        ))}
      </View>
      {/* Flash sale */}
      <View style={{ marginBottom: 10 }}>
        <Skeleton width={120} height={28} />
      </View>
      <View style={{ flexDirection: "row", marginBottom: 18 }}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ marginRight: 12 }}>
            <Skeleton width={110} height={150} radius={12} />
          </View>
        ))}
      </View>
      {/* Sản phẩm gợi ý */}
      <View style={{ marginBottom: 10 }}>
        <Skeleton width={180} height={28} />
      </View>
      {[...Array(4)].map((_, i) => (
        <View key={i} style={{ marginBottom: 14 }}>
          <Skeleton width={width - 32} height={90} radius={12} />
        </View>
      ))}
    </View>
  );
}