import { Feather } from "@expo/vector-icons";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function VariantSelectionModal({
  visible,
  onClose,
  variants,
  selectedVariant,
  onSelect,
  formatCurrency
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide" 
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn phiên bản</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.variantList}>
            {variants.map((variant) => {
              const isSelected = selectedVariant?._id === variant._id;
              const isOutOfStock = variant.stock <= 0;

              return (
                <TouchableOpacity
                  key={variant._id}
                  style={[
                    styles.variantItem,
                    isSelected && styles.selectedVariant,
                    isOutOfStock && styles.outOfStock
                  ]}
                  onPress={() => !isOutOfStock && onSelect(variant)}
                  disabled={isOutOfStock}
                >
                  <View style={styles.variantInfo}>
                    <Text style={[
                      styles.variantName,
                      isSelected && styles.selectedText
                    ]}>
                      {variant.name}
                    </Text>
                    <Text style={[
                      styles.variantPrice,
                      isSelected && styles.selectedText
                    ]}>
                      {formatCurrency(variant.price)}
                    </Text>
                    <Text style={[
                      styles.stockInfo,
                      isOutOfStock && styles.outOfStockText
                    ]}>
                      {isOutOfStock ? 'Hết hàng' : `Còn ${variant.stock} sản phẩm`}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Feather name="check" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  variantList: {
    padding: 16,
  },
  variantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedVariant: {
    borderColor: '#2979ff',
    backgroundColor: '#eef3ff',
  },
  outOfStock: {
    opacity: 0.6,
  },
  variantInfo: {
    flex: 1,
  },
  variantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 15,
    color: '#2979ff',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedText: {
    color: '#2979ff',
  },
  stockInfo: {
    fontSize: 13,
    color: '#666',
  },
  outOfStockText: {
    color: '#dc3545',
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2979ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  }
});