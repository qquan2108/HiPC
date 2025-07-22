import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function CartProductList({ cart, onRemove, onQuantity, onQuantityInput, onVariantChange, formatCurrency, onToggleSelect, selectedIds }) {
  return (
    <View style={styles.cartBox}>
      {cart.map(item => {
        const variants = Array.isArray(item.variants) ? item.variants : [];
        return (
          <View key={item.id} style={styles.productRow}>
            <TouchableOpacity style={styles.checkbox} onPress={() => onToggleSelect(item.id)}>
              <Feather
                name={selectedIds.includes(item.id) ? "check-circle" : "circle"}
                size={22}
                color={selectedIds.includes(item.id) ? "#2979ff" : "#ccc"}
              />
            </TouchableOpacity>
            <Image source={item.image} style={styles.cartImage} />
            <View style={styles.info}>
              <Text style={styles.cartName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.cartPrice}>{formatCurrency(item.price)}</Text>

              {variants.length > 0 && (
                <View style={styles.variantRow}>
                  <Text style={styles.variantLabel}>Phiên bản:</Text>
                  <Picker
                    selectedValue={item.selectedVariant}
                    onValueChange={val => onVariantChange(item.id, val)}
                    style={styles.picker}
                  >
                    {variants.map(v => <Picker.Item label={v} value={v} key={v} />)}
                  </Picker>
                </View>
              )}

              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => onQuantity(item.id, -1)} style={styles.qtyBtn}>
                  <Feather name="minus" size={18} color="#f53d2d" />
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={String(item.quantity)}
                  onChangeText={text => onQuantityInput(item.id, text)}
                />
                <TouchableOpacity onPress={() => onQuantity(item.id, 1)} style={styles.qtyBtn}>
                  <Feather name="plus" size={18} color="#f53d2d" />
                </TouchableOpacity>
              </View>

            </View>
            <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn} activeOpacity={0.7}>
              <Feather name="trash-2" size={20} color="#f55858" />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cartBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  checkbox: { marginRight: 12 },
  cartImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f3f3f3',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  cartName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f53d2d',
    marginVertical: 4,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  variantLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 36,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#f53d2d',
    borderRadius: 4,
    padding: 4,
  },
  qtyInput: {
    marginHorizontal: 8,
    minWidth: 40,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    textAlign: 'center',
    paddingVertical: 2,
  },
  removeBtn: {
    marginLeft: 12,
    padding: 6,
  },
});
