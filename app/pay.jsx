import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/AxiosInstance";

import PayCardModal from "../compomentPay/PayCardModal";
import PayProductList from "../compomentPay/PayProductList";
import PayStatusModal from "../compomentPay/PayStatusModal";
import PayVoucherModal from "../compomentPay/PayVoucherModal";
import AddressModal from "./AddressModal";

// GHN credentials (nên đặt trong .env hoặc expo-constants)
const GHN_TOKEN = "08749195-4da3-11f0-bf1c-e283f3defbd9";
const GHN_SHOP_ID = "196957";
const SHOP_DISTRICT_ID = 1461;      // Mã quận/huyện của shop
const SHOP_WARD_CODE = "21308";     // Mã phường của shop (Phường 12, Gò Vấp)

const paymentMethods = [
  { key: "cod", label: "Thanh toán khi nhận hàng" },
  { key: "bank", label: "Thanh toán bằng thẻ ngân hàng" },
];

function formatCurrency(num) {
  return num.toLocaleString("vi-VN") + "đ";
}

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 1. Giỏ hàng
  const [products, setProducts] = useState([]);
  // 2. Voucher
  const [voucherList, setVoucherList] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucher, setShowVoucher] = useState(false);
  // 3. Thanh toán
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].key);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  // 4. Địa chỉ + master-data GHN
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  // 5. Vận chuyển
  const [shippingServices, setShippingServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null); // Lưu object {service_id, service_type_id,...}
  const shippingFee = 0;
  // 6. Trạng thái đơn
  const [payStatus, setPayStatus] = useState(null);
  // 7. Địa chỉ lưu
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // --- Fetch cart từ backend ---
  useEffect(() => {
    (async () => {
      if (params.selectedProducts) {
        try {
          const selected = JSON.parse(params.selectedProducts);
          setProducts(selected);
          return;
        } catch {}
      }
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userId = user.id || user._id;
        const res = await axiosInstance.get(`/orders/user/${userId}`);
        const orders = Array.isArray(res.data) ? res.data : [];
        const pending = orders.find((o) => o.status === "pending") || { products: [] };
        const items = Array.isArray(pending.products)
          ? pending.products.map((item) => ({
              id: item.productId?._id || item.productId,
              name: item.productId?.name || "Không có tên",
              price: item.productId?.price ?? 0,
              image: item.productId?.image
                ? { uri: item.productId.image }
                : require("../assets/images/pc1.png"),
              quantity: item.quantity ?? 1,
              weight: item.productId?.weight ?? 100,
            }))
          : [];
        setProducts(items);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // --- Fetch vouchers ---
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/vouchers");
        setVoucherList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // --- GHN master-data: province ---
  useEffect(() => {
    axios
      .post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {},
        { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
      )
      .then((res) => {
        setProvinces(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => {
        console.error(err);
        Toast.show({ type: "error", text1: "Không lấy được danh sách tỉnh." });
      });
  }, []);

  // --- GHN master-data: district ---
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
      return;
    }
    axios
      .post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
        { province_id: Number(selectedProvince) },
        { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
      )
      .then((res) => {
        setDistricts(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => {
        console.error(err);
        Toast.show({ type: "error", text1: "Không lấy được danh sách quận." });
      });
    setWards([]);
    setSelectedDistrict(null);
    setSelectedWard(null);
  }, [selectedProvince]);

  // --- GHN master-data: ward ---
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard(null);
      return;
    }
    axios
      .post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        { district_id: Number(selectedDistrict) },
        { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
      )
      .then((res) => {
        setWards(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => {
        console.error(err);
        Toast.show({ type: "error", text1: "Không lấy được danh sách phường." });
      });
    setSelectedWard(null);
  }, [selectedDistrict]);

  // --- GHN: available services ---
  const fetchServicesByAddress = async (address) => {
    try {
      const res = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
        {
          shop_id: Number(GHN_SHOP_ID),
          from_district: SHOP_DISTRICT_ID,
          to_district: Number(address.districtId),
        },
        { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
      );
      setShippingServices(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setShippingServices([]);
      setSelectedService(null);
      Toast.show({ type: "error", text1: "Không lấy được dịch vụ vận chuyển." });
    }
  };

  // Tự động fetch dịch vụ khi đổi địa chỉ
  useEffect(() => {
    if (
      selectedAddress &&
      selectedAddress.provinceId &&
      selectedAddress.districtId &&
      selectedAddress.wardCode
    ) {
      fetchServicesByAddress(selectedAddress);
    } else {
      setShippingServices([]);
      setSelectedService(null);
    }
  }, [selectedAddress]);

  // --- Tính totals ---
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const discount = selectedVoucher
    ? selectedVoucher.percent
      ? Math.round((subtotal * selectedVoucher.percent) / 100)
      : selectedVoucher.value || 0
    : 0;
  const total = subtotal + shippingFee - discount;

  // --- Địa chỉ hiển thị ---
  const addressText = [
    provinces.find((p) => p.ProvinceID === Number(selectedProvince))?.ProvinceName,
    districts.find((d) => d.DistrictID === Number(selectedDistrict))?.DistrictName,
    wards.find((w) => w.WardCode === selectedWard)?.WardName,
  ]
    .filter(Boolean)
    .join(", ");

  // --- Checkout ---
  const handleOrder = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) throw new Error("Chưa xác định được user");
      const user = JSON.parse(userStr);
      const userId = (user._id || user.id || "").toString();

      // Thêm kiểm tra kỹ hơn
      if (!userId || userId === "undefined" || userId === "") {
        console.log("user object:", user);
        throw new Error("Không xác định được user_id");
      }

      const productsData = products.map(p => ({
        productId: p.id || p._id,
        quantity: p.quantity,
      }));

      const orderData = {
        user_id: userId,
        products: productsData,
        total_price: subtotal,
        address: selectedAddress?.address || "",
        paymentMethod: selectedPayment,
        shippingMethod: selectedService?.service_id || null,
        voucher: selectedVoucher?.id || null,
        total,
      };

      console.log("→ orderData:", orderData);

      const res = await axiosInstance.post(
        "/orders/checkout",
        orderData,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      await AsyncStorage.removeItem("cart");
      setProducts([]);
      Toast.show({
        type: "success",
        text1: "Đặt hàng thành công!",
        text2: "Cảm ơn bạn.",
      });
      setPayStatus("success");
      router.push({
        pathname: "/CheckoutSuccess",
        params: {
          orderId: res.data.orderId,
          total,
          products: JSON.stringify(products),
          address: addressText,
          paymentMethod: selectedPayment,
        },
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Đặt hàng thất bại!",
        text2: err.message || "Vui lòng thử lại.",
      });
      setPayStatus("fail");
    }
  };

  // --- Fetch addresses ---
  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await axiosInstance.get(`/users/${user.id || user._id}/addresses`);
      setAddressList(res.data);
      const def = res.data.find((a) => a.isDefault) || res.data[0];
      setSelectedAddress(def || null);
    })();
  }, []);

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
        cards={[]}
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        setShowCardModal={setShowCardModal}
      />
      <AddressModal
        visible={showAddressModal}
        addressList={addressList}
        setAddressList={setAddressList}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        onClose={() => setShowAddressModal(false)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#2979ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>

        {/* Địa chỉ */}
        <View style={styles.infoBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Giao tới</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text style={{ fontWeight: "bold", color: "#222" }}>
                {selectedAddress ? `${selectedAddress.label}: ${selectedAddress.address}` : "Chọn địa chỉ giao hàng"}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.infoEditBtn} onPress={() => setShowAddressModal(true)}>
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

        {/* Giao hàng */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Giao hàng</Text>
        </View>
        <Text style={{ marginHorizontal: 18, marginBottom: 10, color: "#888" }}>
          (Tính năng giao hàng nhanh đang tạm tắt. Đơn hàng sẽ được xử lý thủ công.)
        </Text>

        {/* Thanh toán */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
        </View>
        {paymentMethods.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.paymentRow, selectedPayment === m.key && styles.paymentRowActive]}
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
            <Text style={{ fontWeight: "bold", color: "#222" }}>Thẻ: **** {selectedCard}</Text>
          </View>
        )}

        {/* Tổng cộng */}
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
            <Text style={styles.totalValue}>{shippingFee > 0 ? formatCurrency(shippingFee) : "—"}</Text>
          </View>
          {discount > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={styles.totalLabel}>Giảm giá</Text>
              <Text style={[styles.totalValue, { color: "#2ecc71" }]}>-{formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[styles.totalLabel, { fontSize: 17 }]}>Thành tiền</Text>
            <Text style={[styles.totalValue, { fontSize: 20, color: "#2979ff" }]}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Thành tiền</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handleOrder}>
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
  headerTitle: { fontWeight: "400", fontSize: 22, color: "#222", marginLeft: 4 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    margin: 14,
    padding: 14,
    elevation: 1,
  },
  infoLabel: { fontSize: 14, color: "#2979ff", marginBottom: 2, fontWeight: "bold" },
  infoEditBtn: { backgroundColor: "#eaf3ff", borderRadius: 16, padding: 6, marginLeft: 8 },
  sectionRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 18, marginVertical: 4 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, color: "#222", marginRight: 8 },
  countCircle: { backgroundColor: "#2979ff", borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  countText: { color: "#fff", fontWeight: "bold" },
  couponBtn: { backgroundColor: "#eaf3ff", borderRadius: 10, padding: 6 },
  couponBtnText: { color: "#2979ff", fontWeight: "bold", fontSize: 13 },
  shippingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    margin: 18,
    padding: 12,
  },
  shippingRowActive: {
    backgroundColor: "#eaf3ff",
    borderWidth: 1.5,
    borderColor: "#2979ff",
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
  },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#2979ff" },
  shippingLabel: { fontWeight: "bold", marginRight: 8 },
  shippingDesc: {
    fontSize: 13,
    color: "#2979ff",
    backgroundColor: "#eaf3ff",
    borderRadius: 8,
    padding: 4,
    marginRight: 8,
  },
  shippingPrice: { fontWeight: "bold", color: "#888" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    borderRadius: 10,
    margin: 18,
    padding: 12,
  },
  paymentRowActive: {
    backgroundColor: "#eaf3ff",
    borderWidth: 1.5,
    borderColor: "#2979ff",
  },
  paymentLabel: { fontWeight: "bold", marginLeft: 4 },
  selectedCardBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eaf3ff",
  },
  totalLabel: { fontSize: 15, fontWeight: "bold" },
  totalValue: { fontSize: 18, color: "#2979ff", fontWeight: "bold" },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  payBtn: { backgroundColor: "#222", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32 },
  payBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
