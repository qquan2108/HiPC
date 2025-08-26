import { Skeleton } from "moti/skeleton";
import { Dimensions, View } from "react-native";
const { width } = Dimensions.get("window");

export default function SkeletonBuildPC() {
  return (
    <View style={{ padding: 20 }}>
      {/* Header */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 40} height={40} radius={12} />
      </View>
      {/* Progress bar */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 40} height={12} radius={6} />
      </View>
      {/* Build type scroll */}
      <View style={{ flexDirection: "row", marginBottom: 18 }}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ marginRight: 12 }}>
            <Skeleton colorMode="light" width={120} height={80} radius={16} />
          </View>
        ))}
      </View>
      {/* Price summary */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 40} height={36} radius={10} />
      </View>
      {/* Category list */}
      {[...Array(4)].map((_, i) => (
        <View key={i} style={{ marginBottom: 14 }}>
          <Skeleton colorMode="light" width={width - 40} height={70} radius={14} />
        </View>
      ))}
      {/* Action button */}
      <View style={{ marginTop: 18 }}>
        <Skeleton colorMode="light" width={width - 40} height={48} radius={16} />
      </View>
    </View>
  );
}