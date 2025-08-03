import { View, Dimensions } from "react-native";
import { Skeleton } from "moti/skeleton";
const { width } = Dimensions.get("window");

export default function SkeletonCart() {
  return (
    <View style={{ padding: 18 }}>
      {/* Header */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton width={width - 36} height={36} radius={12} />
      </View>
      {/* Địa chỉ */}
      <View style={{ marginBottom: 18 }}>
        <Skeleton width={width - 36} height={40} radius={12} />
      </View>
      {/* Danh sách sản phẩm */}
      {[...Array(3)].map((_, i) => (
        <View key={i} style={{ marginBottom: 14 }}>
          <Skeleton width={width - 36} height={90} radius={14} />
        </View>
      ))}
      {/* Tổng tiền */}
      <View style={{ marginTop: 18 }}>
        <Skeleton width={width - 36} height={48} radius={14} />
      </View>
      {/* Thanh toán */}
      <View style={{ marginTop: 14 }}>
        <Skeleton width={width - 36} height={48} radius={14} />
      </View>
    </View>
  );
}