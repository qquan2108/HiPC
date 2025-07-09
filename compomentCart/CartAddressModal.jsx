import React from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function CartAddressModal({
  visible,
  addresses,
  editAddressId,
  editAddressText,
  newAddress,
  setShowAddressModal,
  setEditAddressText,
  handleSelectAddress,
  handleEditAddress,
  handleDeleteAddress,
  handleSaveEditAddress,
  setNewAddress,
  handleAddAddress,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => setShowAddressModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Text style={styles.modalTitle}>Quản lý địa chỉ</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowAddressModal(false)}>
              <Feather name="x" size={22} color="#222" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={addresses}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.addressItemRow}>
                <TouchableOpacity
                  style={styles.addressRadio}
                  onPress={() => handleSelectAddress(item.id)}
                >
                  {item.isDefault ? <View style={styles.addressRadioDot} /> : null}
                </TouchableOpacity>
                {editAddressId === item.id ? (
                  <TextInput
                    value={editAddressText}
                    onChangeText={setEditAddressText}
                    style={styles.addressInputEdit}
                    autoFocus
                    onSubmitEditing={handleSaveEditAddress}
                    blurOnSubmit={false}
                  />
                ) : (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => handleSelectAddress(item.id)}
                  >
                    <Text style={[styles.addressItemText, item.isDefault && { color: "#2979ff", fontWeight: "bold" }]}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => handleEditAddress(item.id, item.text)}>
                  <Feather name="edit-2" size={18} color="#2979ff" />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => handleDeleteAddress(item.id)}>
                  <Feather name="trash-2" size={18} color="#f55858" />
                </TouchableOpacity>
                {editAddressId === item.id && (
                  <TouchableOpacity style={{ marginLeft: 8 }} onPress={handleSaveEditAddress}>
                    <Feather name="check" size={20} color="#2979ff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListFooterComponent={
              <View style={styles.addAddressRow}>
                <TextInput
                  value={newAddress}
                  onChangeText={setNewAddress}
                  placeholder="Thêm địa chỉ mới..."
                  style={styles.addressInput}
                />
                <TouchableOpacity style={styles.addAddressBtn} onPress={handleAddAddress}>
                  <Feather name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    maxHeight: "80%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    flex: 1,
  },
  modalCloseBtn: {
    padding: 6,
    marginLeft: 8,
  },
  addressItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f7f8fa",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addressRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2979ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  addressRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2979ff",
  },
  addressItemText: {
    fontSize: 14,
    color: "#222",
    flex: 1,
  },
  addressInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#f7f8fa",
  },
  addressInputEdit: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2979ff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  addAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 2,
  },
  addAddressBtn: {
    backgroundColor: "#2979ff",
    borderRadius: 10,
    padding: 10,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});