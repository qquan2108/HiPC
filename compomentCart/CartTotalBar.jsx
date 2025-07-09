import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

/**
 * CartTotalBar
 * @param {number} total                - Tổng tiền
 * @param {function} formatCurrency     - Hàm định dạng tiền
 * @param {function} onCheckout         - Xử lý khi nhấn mua hàng
 * @param {array} selectedIds           - Danh sách id sản phẩm đã chọn
 * @param {function} onToggleSelectAll  - Hàm chọn/bỏ chọn tất cả
 * @param {boolean} allSelected         - Trạng thái đã chọn tất cả
 * @param {array} voucherList           - Danh sách voucher
 * @param {object} selectedVoucher      - Voucher đang được chọn
 * @param {function} onShowVoucher      - Hàm mở modal voucher
 * @param {function} onClearVoucher     - Hàm xóa voucher
 */
export default function CartTotalBar({
  total,
  discount,
  formatCurrency,
  onCheckout,
  selectedIds,
  onToggleSelectAll,
  allSelected,
  voucherList,
  selectedVoucher,
  onShowVoucher,
  onClearVoucher,
  
}) {
  return (
    <View style={styles.container}>
      {/* Voucher selector */}
      <View style={styles.voucherRow}>
        <TouchableOpacity style={styles.voucherBtn} onPress={onShowVoucher}>
          <Feather name="tag" size={16} color="blue" />
          <Text style={styles.voucherText}>
            {selectedVoucher
              ? `Voucher: ${selectedVoucher.code}`
              : "Chọn mã giảm giá"}
          </Text>
        </TouchableOpacity>
        {selectedVoucher && (
          <TouchableOpacity onPress={onClearVoucher} style={styles.clearBtn}>
            <Text style={styles.clearText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom row: select all, total và mua hàng */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.selectAll} onPress={onToggleSelectAll}>
          <Feather
            name={allSelected ? "check-square" : "square"}
            size={20}
            color="blue"
          />
          <Text style={styles.selectAllText}>Tất cả</Text>
        </TouchableOpacity>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          {discount > 0 && (
            <Text style={styles.savingsText}>
              Tiết kiệm {formatCurrency(discount)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={onCheckout}
          disabled={selectedIds.length === 0}
        >
          <Text style={styles.checkoutText}>
            Mua hàng ({selectedIds.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    paddingBottom: 8,
  },
  voucherRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  voucherBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherText: {
    marginLeft: 4,
    fontSize: 14,
    color: "blue",
    fontWeight: "500",
  },
  clearBtn: {
    marginLeft: "auto",
    padding: 4,
  },
  clearText: {
    fontSize: 12,
    color: "#FF4D4F",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 64,
  },
  selectAll: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  selectAllText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#222",
  },
  totalBox: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 15,
    color: "#222",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    color: "#EE4D2D",
    fontWeight: "bold",
  },
  checkoutBtn: {
    backgroundColor: "blue",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  savingsText: {
    fontSize: 12,
    color: 'blue',
    marginTop: 2,
  },
});
