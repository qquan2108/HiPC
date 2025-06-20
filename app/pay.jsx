import { Feather } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import axiosInstance from "../utils/AxiosInstance";

import PayCardModal from "../compomentPay/PayCardModal";
import PayProductList from "../compomentPay/PayProductList";
import PayStatusModal from "../compomentPay/PayStatusModal";
import PayVoucherModal from "../compomentPay/PayVoucherModal";

// Dữ liệu mẫu
const shippingMethods = [
  { key: "standard", label: "Tiêu chuẩn", desc: "5-7 ngày", price: 0 },
  { key: "express", label: "Nhanh", desc: "1-2 ngày", price: 20000 },
];

const paymentMethods = [
  { key: "cod", label: "Thanh toán khi nhận hàng" },
  { key: "bank", label: "Thanh toán bằng thẻ ngân hàng" },
];

const vouchers = [
  { id: 1, title: "Giảm 5%", desc: "Áp dụng cho đơn từ 1 triệu", expire: "30/06/2025", percent: 5 },
  { id: 2, title: "Giảm 50k", desc: "Áp dụng cho đơn từ 2 triệu", expire: "30/06/2025", percent: 0 },
];

const cards = [
  { id: 1, brand: "visa", number: "1234", name: "Nguyen Van A", expire: "12/25" },
  { id: 2, brand: "mastercard", number: "5678", name: "Nguyen Van B", expire: "11/26" },
];

function formatCurrency(num) {
  return num.toLocaleString("vi-VN") + "đ";
}

export default function PayScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0].key);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].key);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(cards[0].id);
  const [payStatus, setPayStatus] = useState(null);
  const [voucherList, setVoucherList] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  useEffect(() => {
    // Lấy sản phẩm từ giỏ hàng
    const fetchCart = async () => {
      const res = await axiosInstance.get("/orders");
      if (res.data && Array.isArray(res.data)) {
        const cartItems = res.data.flatMap(order =>
          (order.products || []).map(item => ({
            id: item.productId?._id || item.productId,
            name: item.productId?.name || "Không có tên",
            price: item.productId?.price ?? 0,
            image: item.productId?.image
              ? { uri: item.productId.image }
              : require("../assets/images/pc1.png"),
            quantity: item.quantity ?? 1,
          }))
        );
        setProducts(cartItems);
      }
    };
    fetchCart();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      const res = await axiosInstance.get("/vouchers");
      setVoucherList(res.data);
    };
    fetchVouchers();
  }, []);

  // Lấy danh sách tỉnh
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(setProvinces);
  }, []);

  // Lấy quận khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
    } else {
      setDistricts([]);
      setWards([]);
    }
    setSelectedDistrict(null);
    setSelectedWard(null);
  }, [selectedProvince]);

  // Lấy phường khi chọn quận
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
    } else {
      setWards([]);
    }
    setSelectedWard(null);
  }, [selectedDistrict]);

  // Tính tổng tiền
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const shippingFee = shippingMethods.find((m) => m.key === selectedShipping)?.price || 0;
  const discount =
    selectedVoucher?.code === "GIAM5PHANTRAM"
      ? Math.round(subtotal * (selectedVoucher.discount_value / 100))
      : (selectedVoucher?.discount_value || 0); // Nếu có loại giảm giá cố định
  const total = subtotal + shippingFee - discount;

  const handleOrder = async () => {
    try {
      const orderData = {
        products: products.map(p => ({
          productId: p.id,
          quantity: p.quantity,
        })),
        address: "Địa chỉ lấy từ state hoặc user chọn",
        paymentMethod: selectedPayment,
        shippingMethod: selectedShipping,
        voucher: selectedVoucher ? selectedVoucher._id || selectedVoucher.code : null,
        total,
      };

      const response = await axiosInstance.post("/orders/checkout", orderData);

      // Xóa giỏ hàng ở localStorage (nếu có)
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem('cart');
      }
      setProducts([]); // Xóa state giỏ hàng

      Toast.show({
        type: "success",
        text1: "Đặt hàng thành công!",
        text2: "Cảm ơn bạn đã mua hàng tại HiPC.",
        position: "top",
      });

      setPayStatus("success");

      router.push({
        pathname: "/CheckoutSuccess",
        params: {
          orderId: response.data.orderId,
          total: total,
          products: JSON.stringify(products),
          address: address,
          paymentMethod: selectedPayment,
        }
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Đặt hàng thất bại!",
        text2: "Vui lòng thử lại.",
        position: "top",
      });
      setPayStatus("fail");
    }
  };

  const fetchVoucherByCode = async (code) => {
    try {
      const res = await axiosInstance.get(`/vouchers/code/${code}`);
      setSelectedVoucher(res.data); // setSelectedVoucher là state voucher đang chọn
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Mã giảm giá không hợp lệ!",
      });
    }
  };

  const vouchersSafe = Array.isArray(vouchers) ? vouchers : [];

  // Địa chỉ giao hàng
  const address = [
    provinces.find(p => p.code === selectedProvince)?.name,
    districts.find(d => d.code === selectedDistrict)?.name,
    wards.find(w => w.code === selectedWard)?.name,
  ].filter(Boolean).join(', ');

  return (
    <View style={styles.container}>
      <PayStatusModal payStatus={payStatus} setPayStatus={setPayStatus} router={router} />
      <PayVoucherModal
        visible={showVoucher}
        vouchers={voucherList}
        selectedVoucher={selectedVoucher}
        setSelectedVoucher={setSelectedVoucher}
        setShowVoucher={setShowVoucher}
      />
      <PayCardModal
        visible={showCardModal}
        cards={cards}
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        setShowCardModal={setShowCardModal}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#2979ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>

        {/* Địa chỉ giao hàng */}
        <View style={styles.infoBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Giao tới</Text>
            {/* Dropdown chọn tỉnh/thành */}
            <Picker
              selectedValue={selectedProvince ?? ""}
              onValueChange={setSelectedProvince}
              style={{ marginBottom: 4 }}
            >
              <Picker.Item label="Chọn tỉnh/thành" value="" />
              {provinces.map(p => (
                <Picker.Item key={p.code} label={p.name} value={p.code} />
              ))}
            </Picker>
            {/* Dropdown chọn quận/huyện */}
            <Picker
              selectedValue={selectedDistrict ?? ""}
              onValueChange={setSelectedDistrict}
              enabled={!!selectedProvince}
              style={{ marginBottom: 4 }}
            >
              <Picker.Item label="Chọn quận/huyện" value="" />
              {districts.map(d => (
                <Picker.Item key={d.code} label={d.name} value={d.code} />
              ))}
            </Picker>
            {/* Dropdown chọn phường/xã */}
            <Picker
              selectedValue={selectedWard ?? ""}
              onValueChange={setSelectedWard}
              enabled={!!selectedDistrict}
            >
              <Picker.Item label="Chọn phường/xã" value="" />
              {wards.map(w => (
                <Picker.Item key={w.code} label={w.name} value={w.code} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity style={styles.infoEditBtn}>
            <Feather name="edit-2" size={16} color="#2979ff" />
          </TouchableOpacity>
        </View>

        {/* Sản phẩm */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          <View style={styles.countCircle}>
            <Text style={styles.countText}>{products.length}</Text>
          </View>
          <TouchableOpacity style={styles.couponBtn} onPress={() => setShowVoucher(true)}>
            <Text style={styles.couponBtnText}>Thêm mã giảm giá</Text>
          </TouchableOpacity>
        </View>
        <PayProductList products={products} formatCurrency={formatCurrency} />

        {/* Shipping */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Giao hàng</Text>
        </View>
        {shippingMethods.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.shippingRow,
              selectedShipping === m.key && styles.shippingRowActive,
            ]}
            onPress={() => setSelectedShipping(m.key)}
          >
            <View style={styles.radioCircle}>
              {selectedShipping === m.key && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.shippingLabel}>{m.label}</Text>
            <Text style={styles.shippingDesc}>{m.desc}</Text>
            <Text style={styles.shippingPrice}>
              {m.price === 0 ? "Miễn phí" : formatCurrency(m.price)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Payment */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
        </View>
        {paymentMethods.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.paymentRow,
              selectedPayment === m.key && styles.paymentRowActive,
            ]}
            onPress={() => setSelectedPayment(m.key)}
          >
            <View style={styles.radioCircle}>
              {selectedPayment === m.key && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.paymentLabel}>{m.label}</Text>
            {m.key === "bank" && selectedPayment === "bank" && (
              <TouchableOpacity onPress={() => setShowCardModal(true)}>
                <Text style={{ color: "#2979ff", marginLeft: 10, fontWeight: "bold" }}>
                  Chọn thẻ
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
        {selectedPayment === "bank" && (
          <View style={styles.selectedCardBox}>
            <Feather name="credit-card" size={22} color="#2979ff" style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: "bold", color: "#222" }}>
              Thẻ: **** {cards.find((c) => c.id === selectedCard)?.number}
            </Text>
          </View>
        )}

        {/* Tổng tiền */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Tổng cộng</Text>
        </View>
        <View style={{ marginHorizontal: 18, marginBottom: 18 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={styles.totalLabel}>Tạm tính</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={styles.totalLabel}>Phí giao hàng</Text>
            <Text style={styles.totalValue}>
              {shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={styles.totalLabel}>Giảm giá</Text>
              <Text style={[styles.totalValue, { color: "#2ecc71" }]}>
                -{formatCurrency(discount)}
              </Text>
            </View>
          )}
          <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[styles.totalLabel, { fontSize: 17 }]}>Thành tiền</Text>
            <Text style={[styles.totalValue, { fontSize: 20, color: "#2979ff" }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Thành tiền</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handleOrder}
        >
          <Text style={styles.payBtnText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafbff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#eaf3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontWeight: "400",
    fontSize: 22,
    color: "#222",
    flex: 1,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoLabel: {
    fontSize: 14,
    color: "#2979ff",
    marginBottom: 2,
    fontWeight: "bold",
    letterSpacing: 0.1,
  },
  infoText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    marginBottom: 2,
    lineHeight: 20,
  },
  infoEditBtn: {
    backgroundColor: "#eaf3ff",
    borderRadius: 16,
    padding: 6,
    marginLeft: 8,
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    marginRight: 8,
    letterSpacing: 0.1,
  },
  countCircle: {
    backgroundColor: "#2979ff",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    paddingHorizontal: 6,
  },
  countText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  couponBtn: {
    backgroundColor: "#eaf3ff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: "auto",
  },
  couponBtnText: {
    color: "#2979ff",
    fontWeight: "bold",
    fontSize: 13,
  },
  shippingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  shippingRowActive: {
    backgroundColor: "#eaf3ff",
    borderColor: "#2979ff",
    borderWidth: 1.5,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2979ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2979ff",
  },
  shippingLabel: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
    marginRight: 8,
  },
  shippingDesc: {
    fontSize: 13,
    color: "#2979ff",
    backgroundColor: "#eaf3ff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  shippingPrice: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#888",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  paymentRowActive: {
    backgroundColor: "#eaf3ff",
    borderColor: "#2979ff",
    borderWidth: 1.5,
  },
  paymentLabel: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
    marginLeft: 4,
  },
  selectedCardBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 10,
    marginTop: -2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#eaf3ff",
    elevation: 1,
  },
  totalLabel: {
    fontSize: 15,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 18,
    color: "#2979ff",
    fontWeight: "bold",
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    height: 64,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  payBtn: {
    backgroundColor: "#222",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    minWidth: 120,
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});