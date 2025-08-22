import { Image, StyleSheet, Text, View } from "react-native";

export default function PayProductList({ products, formatCurrency }) {
  // Hàm render biến thể giống CartProductList
  const renderVariantInfo = (item) => {
    if (!item.variant) return null;

    // Kiểu cũ: { key: "A + B", label: "X + Y" }
    if (typeof item.variant === 'object' && item.variant.key && item.variant.label) {
      const { key, label } = item.variant;
      if (key.includes(' + ') && label.includes(' + ')) {
        const keys = key.split(' + ').map(k => k.trim());
        const labels = label.split(' + ').map(l => l.trim());
        return (
          <View>
            {keys.map((k, idx) => (
              <Text style={styles.variantText} key={`old_${k}_${idx}`}>
                {k}: {labels[idx] || ''}
              </Text>
            ))}
          </View>
        );
      }
      return (
        <Text style={styles.variantText}>
          {key}: {label}
        </Text>
      );
    }

    // Kiểu mới: { "Phiên Bản": "Tray", "Bảo Hành": "3 năm" }
    if (typeof item.variant === 'object' && Object.keys(item.variant).length > 0) {
      return (
        <View>
          {Object.entries(item.variant).map(([variantType, variantValue], idx) => {
            if (['key', 'label', 'priceDiff'].includes(variantType)) return null;
            const displayValue = typeof variantValue === 'object' && variantValue !== null
              ? (variantValue.label || variantValue.value || variantValue)
              : variantValue;
            return (
              <Text style={styles.variantText} key={`new_${variantType}_${idx}`}>
                {variantType}: {displayValue}
              </Text>
            );
          })}
        </View>
      );
    }

    // Kiểu string
    if (typeof item.variant === 'string') {
      return (
        <Text style={styles.variantText}>
          Phân loại: {item.variant}
        </Text>
      );
    }

    return null;
  };

  return (
    <View>
      {products.map((item) => (
        <View key={item.id} style={styles.productRow}>
          <Image source={item.image} style={styles.productImg} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {/* Hiển thị biến thể tách dòng giống CartProductList */}
            {renderVariantInfo(item)}
            {/* Hiển thị giá đã bao gồm biến thể */}
            <Text style={styles.productPrice}>
              {formatCurrency(item.price)}
            </Text>
          </View>
          <View style={styles.productQtyCircle}>
            <Text style={styles.productQtyText}>{item.quantity}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
  },
  productImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f3f3",
  },
  productName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
    marginBottom: 2,
  },
  variantText: {
    fontSize: 13,
    color: "#2979ff",
    marginBottom: 2,
  },
  productPrice: {
    color: "#2979ff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  productQtyCircle: {
    backgroundColor: "#2979ff",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  productQtyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});