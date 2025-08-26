import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

export default function PayProductList({ products, formatCurrency }) {
  // Hàm render biến thể giống CartProductList
  const renderVariantInfo = (item) => {
    if (!item.variant) return null;

    // Handle variant object from FlashSale
    if (item.variant._id) {
      return (
        <Text style={styles.variantText}>
          {item.variant.key}: {item.variant.label}
        </Text>
      );
    }

    // Rest of your existing variant handling...
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

  // Add combo renderer function
  const renderComboProducts = (item) => {
    if (item.type !== 'combo') return null;

    const cd = item.comboDetails;
    const productList = Array.isArray(cd?.products) ? cd.products : [];

    if (!productList.length) {
      return (
        <View style={styles.comboProductsWrap}>
          <View style={styles.comboHeaderRow}>
            <View style={styles.comboHeaderContent}>
              <Feather name="package" size={14} />
              <Text style={styles.comboHeaderText}>
                🎮 {cd?.name || 'Combo'}
              </Text>
            </View>
          </View>
          <Text style={styles.comboEmptyText}>Đang tải thông tin combo...</Text>
        </View>
      );
    }

    // Map combo products
    const lineItems = productList.map((p) => {
      const v = p?._displayVariant || p?.selectedVariant;
      const variantLabel = v?.name || null;
      const image = p?.image || p?.productId?.image || item.image || '';

      return {
        _id: p?._id || p?.productId?._id || p?.productId || Math.random().toString(36).slice(2),
        name: p?.name || p?.productId?.name || 'Sản phẩm',
        variantLabel,
        image,
      };
    });

    return (
      <View style={styles.comboProductsWrap}>
        {/* Combo Header */}
        <View style={styles.comboHeaderRow}>
          <View style={styles.comboHeaderContent}>
            <Feather name="package" size={14} color="#ff6b35" />
            <Text style={styles.comboHeaderText}>
              🎮 {cd?.name || 'Combo'}
            </Text>
          </View>
        </View>

        {/* Combo Products */}
        {lineItems.map((row, index) => (
          <View key={row._id} style={styles.comboLine}>
            <View style={styles.productIndex}>
              <Text style={styles.productIndexText}>{index + 1}</Text>
            </View>

            <Image
              source={typeof row.image === 'string' && row.image ? { uri: row.image } : require('../assets/images/pc1.png')}
              style={styles.comboThumb}
            />
            
            <View style={styles.comboLineContent}>
              <Text style={styles.comboProdName}>
                {row.name}
              </Text>

              {row.variantLabel ? (
                <View style={styles.variantBadgeWrap}>
                  <Text style={styles.variantBadge}>
                    {row.variantLabel}
                  </Text>
                </View>
              ) : (
                <View style={styles.variantBadgeWrap}>
                  <Text style={styles.variantBadgeMuted}>Chưa có biến thể</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Combo Price */}
        <View style={styles.comboFooterRow}>
          <Text style={styles.comboFooterLabel}>Giá combo ({lineItems.length} sản phẩm)</Text>
          <Text style={styles.comboFooterValue}>
            {formatCurrency(item.price)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      {products.map((item) => (
        <View key={item.id} style={styles.productRow}>
          {item.type === 'combo' ? (
            // Render combo
            renderComboProducts(item)
          ) : (
            // Render regular product
            <>
              <Image 
                source={
                  typeof item.image === 'string'
                    ? { uri: item.image }
                    : item.image || require('../assets/images/pc1.png')
                } 
                style={styles.productImg}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                {renderVariantInfo(item)}
                <Text style={styles.productPrice}>
                  {formatCurrency(item.price)}
                </Text>
              </View>
              <View style={styles.productQtyCircle}>
                <Text style={styles.productQtyText}>{item.quantity}</Text>
              </View>
            </>
          )}
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

  // New combo styles
  comboProductsWrap: {
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ff6b3520',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },

  comboHeaderRow: {
    padding: 12,
    backgroundColor: '#fff8f3',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe4d6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  comboHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  comboHeaderText: {
    fontSize: 13,
    color: '#ff6b35',
    fontWeight: '600',
    flex: 1,
  },

  comboLine: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'flex-start',
    minHeight: 70,
  },

  comboLineContent: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'flex-start',
  },

  comboProdName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 18,
    flexWrap: 'wrap',
  },

  variantBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },

  variantBadge: {
    fontSize: 12,
    color: '#2979ff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    lineHeight: 16,
    textAlign: 'left',
    flexShrink: 1,
  },

  variantBadgeMuted: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontStyle: 'italic',
    lineHeight: 16,
    textAlign: 'left',
    flexShrink: 1,
  },

  comboThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f5f7fa',
    marginRight: 12,
    flexShrink: 0,
  },

  productIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
    marginTop: 2,
  },

  productIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },

  comboEmptyText: {
    padding: 16,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },

  comboFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff8f3',
    borderTopWidth: 1,
    borderTopColor: '#ffe4d6',
  },

  comboFooterLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  comboFooterValue: {
    fontSize: 14,
    color: '#ee4d2d',
    fontWeight: 'bold',
  }
});