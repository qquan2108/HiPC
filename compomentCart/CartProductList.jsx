import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function CartProductList({ cart, onRemove, onQuantity, formatCurrency }) {
  return (
    <View style={styles.cartBox}>
      {cart.map(item => (
        <View key={item.id} style={styles.cartItem}>
          <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.cartRemoveBtn}>
            <Feather name="trash-2" size={18} color="#f55858" />
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#f7f8fa',
    padding: 8,
    position: 'relative',
  },
  cartRemoveBtn: {
    position: 'absolute',
    left: 6,
    top: 6,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
  cartImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f3f3f3',
    marginLeft: 32,
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
});