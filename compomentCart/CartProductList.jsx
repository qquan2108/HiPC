import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CartProductList({ cart, onRemove, onQuantity, formatCurrency, onToggleSelect, selectedIds }) {
  return (
    <View style={styles.cartBox}>
      {cart.map(item => (
        <View key={item.id} style={styles.productRow}>
          {/* Checkbox tròn */}
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => onToggleSelect(item.id)}
          >
            <Feather
              name={selectedIds.includes(item.id) ? "check-circle" : "circle"}
              size={22}
              color={selectedIds.includes(item.id) ? "#2979ff" : "#ccc"}
            />
          </TouchableOpacity>
          <Image source={item.image} style={styles.cartImage} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.cartName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.cartPrice}>{formatCurrency(item.price)}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => onQuantity(item.id, -1)} style={styles.qtyBtn}>
                <Feather name="minus" size={16} color="#2979ff" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => onQuantity(item.id, 1)} style={styles.qtyBtn}>
                <Feather name="plus" size={16} color="#2979ff" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Icon thùng rác mới, đặt bên phải */}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={styles.cartRemoveBtn}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={20} color="#f55858" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cartBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#f7f8fa',
    padding: 8,
    position: 'relative',
  },
  checkbox: {
    marginRight: 10,
    padding: 4,
  },
  cartImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f3f3f3',
  },
  cartName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },
  cartPrice: {
    color: '#2979ff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyBtn: {
    backgroundColor: '#eaf3ff',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 4,
  },
  qtyText: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
  cartRemoveBtn: {
    marginLeft: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 6,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});