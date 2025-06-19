import React from "react";
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function PayVoucherModal({ visible, vouchers, selectedVoucher, setSelectedVoucher, setShowVoucher }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.voucherModal}>
          <Text style={styles.modalTitle}>Mã giảm giá</Text>
          <FlatList
            data={Array.isArray(vouchers) ? vouchers : []}
            keyExtractor={(item, idx) => item?._id?.toString() || item?.code?.toString() || idx.toString()}
            renderItem={({ item }) => (
              <View style={styles.voucherCard}>
                <View style={styles.voucherLeft}>
                  <Text style={styles.voucherLabel}>Voucher</Text>
                  <Text style={styles.voucherTitle}>{item?.code || ""}</Text>
                  <Text style={styles.voucherDesc}>{item?.description || ""}</Text>
                  <Text>
                    {item?.discount_value
                      ? (item.code === "GIAM5PHANTRAM"
                          ? `Giảm ${item.discount_value}%`
                          : `Giảm ${item.discount_value.toLocaleString("vi-VN")}đ`)
                      : ""}
                  </Text>
                </View>
                <View style={styles.voucherRight}>
                  <TouchableOpacity
                    style={[
                      styles.voucherBtn,
                      selectedVoucher &&
                        (selectedVoucher._id === item._id || selectedVoucher.code === item.code) &&
                        styles.voucherBtnActive,
                    ]}
                    onPress={() => {
                      setSelectedVoucher(item);
                      setShowVoucher(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.voucherBtnText,
                        selectedVoucher &&
                          (selectedVoucher._id === item._id || selectedVoucher.code === item.code) && { color: "#fff" },
                      ]}
                    >
                      {selectedVoucher && (selectedVoucher._id === item._id || selectedVoucher.code === item.code)
                        ? "Đã áp dụng"
                        : "Áp dụng"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowVoucher(false)}
          >
            <Feather name="x" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.10)",
    justifyContent: "flex-end",
  },
  voucherModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    paddingBottom: 0,
    maxHeight: "60%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 16,
  },
  voucherCard: {
    flexDirection: "row",
    backgroundColor: "#f7f8fa",
    borderRadius: 14,
    marginBottom: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eaf3ff",
  },
  voucherLeft: {
    flex: 1,
  },
  voucherLabel: {
    color: "#2979ff",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  voucherTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginBottom: 2,
  },
  voucherDesc: {
    color: "#888",
    fontSize: 13,
    marginBottom: 2,
  },
  voucherRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
  },
  voucherExpire: {
    fontSize: 11,
    color: "#888",
    marginBottom: 8,
  },
  voucherBtn: {
    backgroundColor: "#eaf3ff",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  voucherBtnActive: {
    backgroundColor: "#2979ff",
  },
  voucherBtnText: {
    color: "#2979ff",
    fontWeight: "bold",
    fontSize: 13,
  },
  closeModalBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
});