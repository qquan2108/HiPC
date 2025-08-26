import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import axiosInstance from "../utils/AxiosInstance";

export default function VnPayModal({
  visible,
  orderId,
  amount,
  orderInfo,
  onClose,
}) {
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPaymentUrl(null);
      return;
    }
    setLoading(true);
    axiosInstance
      .post("/vnpay/create_payment", { orderId, amount, orderInfo })
      .then((res) => {
        const data = res.data;
        if (data.code === 0 && data.data.paymentUrl) {
          setPaymentUrl(data.data.paymentUrl);
        } else {
          throw new Error(data.message || "Không có URL thanh toán");
        }
      })
      .catch((err) =>
        onClose({
          success: false,
          message: err?.message || "Không tạo được URL thanh toán",
        })
      )
      .finally(() => setLoading(false));
  }, [visible]);

  const handleMessage = (event) => {
    try {
      const payload = JSON.parse(event?.nativeEvent?.data || "{}");
      // backend /vnpay_return sẽ trả { status, code, message, orderId, amount }
      const ok = payload?.status === "success" || payload?.code === "00";
      onClose({
        success: ok,
        code: payload?.code,
        message: payload?.message,
        data: payload,
      });
    } catch {
      onClose({ success: false, message: "Không đọc được dữ liệu thanh toán" });
    }
  };
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onClose({ success: false })}>
          <Feather name="x" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Thanh toán VNPAY</Text>
      </View>
      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Thanh toán VNPAY không hỗ trợ trên nền tảng web.</Text>
        </View>
      ) : loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      ) : paymentUrl ? (
        <WebView
          source={{ uri: paymentUrl }}
          onMessage={handleMessage}
          onError={() =>
            onClose({ success: false, message: "Kết nối VNPAY lỗi" })
          }
          startInLoadingState
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f7f7f7",
  },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "bold" },
});
