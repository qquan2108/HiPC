import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function PayStatusModal({ payStatus, setPayStatus, router }) {
  if (!payStatus) return null;
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.statusOverlay}>
        <View style={styles.statusModal}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setPayStatus(null)}
          >
            <Feather name="x" size={24} color="#222" />
          </TouchableOpacity>
          {payStatus === "loading" && (
            <>
              <View style={styles.statusIconCircle}>
                <ActivityIndicator size={48} color="#2979ff" />
              </View>
              <Text style={styles.statusTitle}>Thanh toán đang tiến hành</Text>
              <Text style={styles.statusDesc}>Vui lòng chờ trong giây lát</Text>
            </>
          )}
          {payStatus === "fail" && (
            <>
              <View style={[styles.statusIconCircle, { backgroundColor: "#ffeaea" }]}>
                <Feather name="x-circle" size={48} color="#f55858" />
              </View>
              <Text style={styles.statusTitle}>Thanh toán thất bại</Text>
              <Text style={styles.statusDesc}>
                Vui lòng kiểm tra lại phương thức thanh toán và thử lại
              </Text>
              <View style={{ flexDirection: "row", marginTop: 18 }}>
                <TouchableOpacity
                  style={styles.statusBtn}
                  onPress={() => setPayStatus(null)}
                >
                  <Text style={styles.statusBtnText}>Thử lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusBtn, { backgroundColor: "#eee", marginLeft: 10 }]}
                  onPress={() => setPayStatus(null)}
                >
                  <Text style={[styles.statusBtnText, { color: "#222" }]}>Thoát</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {payStatus === "success" && (
            <>
              <View style={[styles.statusIconCircle, { backgroundColor: "#eafbe7" }]}>
                <Feather name="check-circle" size={48} color="#2ecc71" />
              </View>
              <Text style={styles.statusTitle}>Thanh toán thành công !</Text>
              <Text style={styles.statusDesc}>
                Thẻ của bạn đã được trừ tiền thành công
              </Text>
              <TouchableOpacity
                style={[styles.statusBtn, { backgroundColor: "#eaf3ff", marginTop: 18 }]}
                onPress={() => {
                  setPayStatus(null);
                  router.push("./donhang");
                }}
              >
                <Text style={[styles.statusBtnText, { color: "#2979ff" }]}>
                  Theo dõi đơn hàng
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  statusOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusModal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    alignSelf: "center",
  },
  statusTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  statusDesc: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginBottom: 2,
  },
  statusBtn: {
    backgroundColor: "#222",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  statusBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});