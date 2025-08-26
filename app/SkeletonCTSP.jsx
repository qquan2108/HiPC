import { Skeleton } from "moti/skeleton";
import { Dimensions, View } from "react-native";
const { width } = Dimensions.get("window");

export default function SkeletonCTSP() {
  return (
    <View style={{ padding: 16 }}>
      {/* Header */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 32} height={36} radius={12} />
      </View>
      {/* Ảnh sản phẩm */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 32} height={220} radius={18} />
      </View>
      {/* Tên sản phẩm */}
      <View style={{ marginBottom: 10 }}>
        <Skeleton colorMode="light" width={width - 80} height={28} radius={8} />
      </View>
      {/* Meta */}
      <View style={{ marginBottom: 10 }}>
        <Skeleton colorMode="light" width={width - 120} height={18} radius={8} />
      </View>
      {/* Giá */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={120} height={28} radius={8} />
      </View>
      {/* Option/variant */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 32} height={40} radius={10} />
      </View>
      {/* Mô tả */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 32} height={60} radius={10} />
      </View>
      {/* Specs */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton colorMode="light" width={width - 32} height={40} radius={10} />
      </View>
      {/* Nút mua */}
      <View style={{ marginTop: 18 }}>
        <Skeleton colorMode="light" width={width - 32} height={48} radius={14} />
      </View>
    </View>
  );
}