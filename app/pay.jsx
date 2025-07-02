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
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/AxiosInstance";
import VnPayModal from "../compomentPay/Vnpaymodal";
import PayCardModal from "../compomentPay/PayCardModal";
import PayProductList from "../compomentPay/PayProductList";
import PayStatusModal from "../compomentPay/PayStatusModal";
import AddressModal from "./AddressModal";

// GHN credentials
const GHN_TOKEN = "08749195-4da3-11f0-bf1c-e283f3defbd9";
const GHN_SHOP_ID = "196957";
const SHOP_DISTRICT_ID = 1461;
const SHOP_WARD_CODE = "21308";
const GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";

const paymentMethods = [
  { key: "cod", label: "Thanh toán khi nhận hàng" },
  { key: "bank", label: "Thanh toán bằng thẻ ngân hàng" },
  { key: "vnpay", label: "Thanh toán qua VNPAY" },
];

function formatCurrency(num) {
  return typeof num === "number" ? num.toLocaleString("vi-VN") + " đ" : "";
}

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // States
  const [products, setProducts] = useState([]);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [voucherList, setVoucherList] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].key);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [shippingServices, setShippingServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [payStatus, setPayStatus] = useState(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [showVnPayModal, setShowVnPayModal] = useState(false);
  const [vnpayData, setVnpayData] = useState(null);

  // Calculations
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  // Tính giảm giá từ trường discount_value (dùng chung với CartScreen)
  const discount = selectedVoucher
    ? selectedVoucher.discount_value != null
      ? selectedVoucher.discount_value > 0 &&
        selectedVoucher.discount_value < 100
        ? // nếu <100 coi là %, ngược lại coi là số tiền cố định
          Math.round((subtotal * selectedVoucher.discount_value) / 100)
        : selectedVoucher.discount_value
      : 0
    : 0;
  const total = subtotal + shippingFee - discount;
  const totalWeight = products.reduce(
    (sum, p) => sum + (p.weight || 10000) * p.quantity, // Default weight 100g
    0
  );

  // GHN API Helper
  const ghnRequest = async (endpoint, data = {}, method = "POST") => {
    try {
      const config = {
        method,
        url: `${GHN_BASE_URL}${endpoint}`,
        headers: {
          "Content-Type": "application/json",
          Token: GHN_TOKEN,
          ShopId: GHN_SHOP_ID,
        },
        data,
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(
        `GHN API Error (${endpoint}):`,
        error.response?.data || error.message
      );
      throw error;
    }
  };

  // Fetch available shipping services
  const fetchShippingServices = async (address) => {
    if (!address || !address.districtId) return;

    setIsLoadingShipping(true);
    try {
      const response = await ghnRequest(
        "/v2/shipping-order/available-services",
        {
          shop_id: parseInt(GHN_SHOP_ID),
          from_district: SHOP_DISTRICT_ID,
          to_district: parseInt(address.districtId),
        }
      );

      const services = response.data || [];
      setShippingServices(services);

      // Auto select first service if available
      if (services.length > 0 && !selectedService) {
        setSelectedService(services[0]);
      }
    } catch (error) {
      console.error("Error fetching shipping services:", error);
      setShippingServices([]);
      setSelectedService(null);
      Toast.show({
        type: "error",
        text1: "Không thể tải dịch vụ vận chuyển",
        text2: "Vui lòng kiểm tra địa chỉ giao hàng",
      });
    } finally {
      setIsLoadingShipping(false);
    }
  };

  // Calculate shipping fee - FIXED VERSION
  const calculateShippingFee = async (service, address) => {
    if (
      !service ||
      !address ||
      !address.districtId ||
      !address.wardCode ||
      totalWeight <= 0
    ) {
      setShippingFee(0);
      return;
    }

    try {
      // Tính tổng trọng lượng, đảm bảo >= 50g (yêu cầu tối thiểu của GHN)
      const calculatedWeight = Math.max(totalWeight, 50);

      // Payload cơ bản
      const baseData = {
        service_type_id: service.service_type_id,
        from_district_id: SHOP_DISTRICT_ID,
        from_ward_code: SHOP_WARD_CODE,
        to_district_id: parseInt(address.districtId, 10),
        to_ward_code: address.wardCode,
        insurance_value: selectedPayment === "cod" ? 0 : subtotal,
        cod_money: selectedPayment === "cod" ? total : 0,
      };

      let requestData;

      // Phân biệt theo loại dịch vụ
      if (service.service_type_id === 5) {
        // Dịch vụ hàng nặng - sử dụng mảng items
        requestData = {
          ...baseData,
          items: products.map((p) => ({
            length: p.length || 20, // cm
            width: p.width || 20, // cm
            height: p.height || 20, // cm
            weight: Math.max(p.weight || 100, 50), // gram, tối thiểu 50g
            quantity: p.quantity || 1,
          })),
        };
      } else {
        // Dịch vụ hàng nhẹ - sử dụng các trường top-level
        requestData = {
          ...baseData,
          weight: calculatedWeight, // Tổng trọng lượng
          length: 20, // Kích thước gói hàng mặc định
          width: 20,
          height: 20,
        };
      }

      console.log("Payload gửi đi:", JSON.stringify(requestData, null, 2));

      const response = await ghnRequest("/v2/shipping-order/fee", requestData);
      const fee = response.data?.total || 0;
      setShippingFee(fee);
      console.log("Phí vận chuyển tính được:", fee);
    } catch (error) {
      console.error("Lỗi tính phí vận chuyển:", error);
      setShippingFee(0);
      Toast.show({
        type: "error",
        text1: "Không thể tính phí vận chuyển",
        text2: "Đang sử dụng phí mặc định 0đ",
      });
    }
  };

  // Load addresses and preserve existing ones
  const loadAddresses = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await axiosInstance.get(
        `/users/${user.id || user._id}/addresses`
      );
      let addresses = Array.isArray(res.data) ? res.data : [];

      // Nếu chưa có địa chỉ nào, tạo 1 phần tử từ profile của user
      if (addresses.length === 0 && user.address) {
        addresses = [
          {
            id: "self", // id riêng, khác với server
            recipientName: user.full_name, // tên người nhận
            phoneNumber: user.phone, // số điện thoại
            address: user.address, // địa chỉ chi tiết profile
            provinceId: user.provinceId, // có thể undefined nếu chưa lưu
            districtId: user.districtId,
            wardCode: user.wardCode,
            isDefault: true,
          },
        ];
      }
      setAddressList(addresses);

      // Chỉ set selectedAddress nếu chưa có hoặc địa chỉ hiện tại không còn trong danh sách
      const defaultAddr =
        addresses.find((a) => a.isDefault) || addresses[0] || null;
      setSelectedAddress(defaultAddr);
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  // Handle new address added
  const handleAddressAdded = async (newAddress) => {
    // Refresh address list
    await loadAddresses();
    // Select the new address
    setSelectedAddress(newAddress);
    setShowAddressModal(false);
  };

  // Effects
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
        const pending = orders.find((o) => o.status === "pending") || {
          products: [],
        };
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
              length: item.productId?.length ?? 20,
              width: item.productId?.width ?? 20,
              height: item.productId?.height ?? 20,
            }))
          : [];
        setProducts(items);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Khi mount, nếu có voucher trong params thì parse và set
  useEffect(() => {
    if (params.selectedVoucher) {
      try {
        setSelectedVoucher(JSON.parse(params.selectedVoucher));
      } catch (e) {
        console.warn("Không parse được voucher từ params:", e);
      }
    }
  }, [params.selectedVoucher]);

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

  useEffect(() => {
    (async () => {
      try {
        const response = await ghnRequest("/master-data/province");
        setProvinces(response.data || []);
      } catch (err) {
        console.error(err);
        Toast.show({ type: "error", text1: "Không lấy được danh sách tỉnh." });
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict(null);
      setSelectedWard(null);
      return;
    }

    (async () => {
      try {
        const response = await ghnRequest("/master-data/district", {
          province_id: parseInt(selectedProvince),
        });
        setDistricts(response.data || []);
      } catch (err) {
        console.error(err);
        Toast.show({ type: "error", text1: "Không lấy được danh sách quận." });
      }
    })();

    setWards([]);
    setSelectedDistrict(null);
    setSelectedWard(null);
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard(null);
      return;
    }

    (async () => {
      try {
        const response = await ghnRequest("/master-data/ward", {
          district_id: parseInt(selectedDistrict),
        });
        setWards(response.data || []);
      } catch (err) {
        console.error(err);
        Toast.show({
          type: "error",
          text1: "Không lấy được danh sách phường.",
        });
      }
    })();

    setSelectedWard(null);
  }, [selectedDistrict]);

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Fetch shipping services when address changes
  useEffect(() => {
    if (selectedAddress) {
      fetchShippingServices(selectedAddress);
    } else {
      setShippingServices([]);
      setSelectedService(null);
      setShippingFee(0);
    }
  }, [selectedAddress]);

  // Calculate shipping fee when service or address changes
  useEffect(() => {
    if (selectedService && selectedAddress) {
      calculateShippingFee(selectedService, selectedAddress);
    } else {
      setShippingFee(0);
    }
  }, [
    selectedService,
    selectedAddress,
    totalWeight,
    selectedPayment,
    subtotal,
    total,
  ]);

  const addressText = [
    provinces.find((p) => p.ProvinceID === parseInt(selectedProvince))
      ?.ProvinceName,
    districts.find((d) => d.DistrictID === parseInt(selectedDistrict))
      ?.DistrictName,
    wards.find((w) => w.WardCode === selectedWard)?.WardName,
  ]
    .filter(Boolean)
    .join(", ");

  const handleOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: "error",
        text1: "Vui lòng chọn địa chỉ giao hàng",
      });
      return;
    }

    if (products.length === 0) {
      Toast.show({
        type: "error",
        text1: "Giỏ hàng trống",
      });
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) throw new Error("Chưa xác định được user");
      const user = JSON.parse(userStr);
      const userId = (user._id || user.id || "").toString();
      if (!userId || userId === "undefined" || userId === "") {
        console.log("user object:", user);
        throw new Error("Không xác định được user_id");
      }

      const productsData = products.map((p) => ({
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
        shippingFee,
      };

      console.log("→ orderData:", orderData);

        const res = await axiosInstance.post("/orders/checkout", orderData, {
          headers: { "Content-Type": "application/json" },
        });
        await AsyncStorage.removeItem("cart");
        setProducts([]);

        if (selectedPayment === "vnpay") {
          setVnpayData({
            orderId: res.data.orderId,
            amount: total,
            orderInfo: `Thanh toán đơn hàng ${res.data.orderId}`,
          });
          setShowVnPayModal(true);
          return;
        }

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
            address: selectedAddress?.address || addressText,
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

  const handleVnPayClose = async (result) => {
    setShowVnPayModal(false);

    if (!vnpayData?.orderId) {
      Toast.show({ type: "error", text1: result?.message || "Thanh toán thất bại" });
      setPayStatus("fail");
      return;
    }

    try {
      const verifyRes = await axiosInstance.post("/vnpay/verify_payment", {
        orderId: vnpayData.orderId,
        code: result?.code,
      });

      if (verifyRes.data?.success) {
        Toast.show({ type: "success", text1: "Đặt hàng thành công!" });
        setPayStatus("success");
        router.push({
          pathname: "/CheckoutSuccess",
          params: {
            orderId: vnpayData.orderId,
            total,
            products: JSON.stringify(products),
            address: selectedAddress?.address || addressText,
            paymentMethod: selectedPayment,
          },
        });
      } else {
        Toast.show({ type: "error", text1: verifyRes.data?.message || "Thanh toán thất bại" });
        setPayStatus("fail");
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: result?.message || "Thanh toán thất bại" });
      setPayStatus("fail");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Address Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
        <TouchableOpacity
          style={styles.addressContainer}
          onPress={() => setShowAddressModal(true)}
        >
          {selectedAddress ? (
            <View>
              <Text style={styles.addressName}>
                {selectedAddress.recipientName}
              </Text>
              <Text style={styles.addressPhone}>
                {selectedAddress.phoneNumber}
              </Text>
              <Text style={styles.addressText}>{selectedAddress.address}</Text>
            </View>
          ) : (
            <Text style={styles.noAddressText}>Chọn địa chỉ giao hàng</Text>
          )}
          <Feather name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      {/* Product List */}
      <PayProductList products={products} formatCurrency={formatCurrency} />

      {/* Shipping Services */}
      {shippingServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          {shippingServices.map((service) => (
            <TouchableOpacity
              key={service.service_id}
              style={[
                styles.serviceItem,
                selectedService?.service_id === service.service_id &&
                  styles.selectedService,
              ]}
              onPress={() => setSelectedService(service)}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.short_name}</Text>
                <Text style={styles.serviceDesc}>{service.service_name}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedService?.service_id === service.service_id && (
                  <View style={styles.radioSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Voucher giảm giá */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mã giảm giá</Text>
        <TouchableOpacity
          style={styles.voucherContainer}
          onPress={() => setShowVoucher(true)}
        >
          <Text style={styles.voucherText}>
            {selectedVoucher
              ? selectedVoucher.discount_value < 100
                ? `Giảm ${selectedVoucher.discount_value}%`
                : `Giảm ${selectedVoucher.discount_value.toLocaleString(
                    "vi-VN"
                  )} đ`
              : "Chọn voucher"}
          </Text>
          <Feather name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.key}
            style={[
              styles.paymentItem,
              selectedPayment === method.key && styles.selectedPayment,
            ]}
            onPress={() => setSelectedPayment(method.key)}
          >
            <Text>{method.label}</Text>
            <View style={styles.radioButton}>
              {selectedPayment === method.key && (
                <View style={styles.radioSelected} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text>Tạm tính</Text>
          <Text>{formatCurrency(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Phí vận chuyển</Text>
          <Text>
            {isLoadingShipping ? "Đang tính..." : formatCurrency(shippingFee)}
          </Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Giảm giá</Text>
            <Text style={styles.discountText}>-{formatCurrency(discount)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Tổng cộng</Text>
          <Text style={styles.totalText}>{formatCurrency(total)}</Text>
        </View>
      </View>

      {/* Order Button */}
      <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
        <Text style={styles.orderButtonText}>Đặt hàng</Text>
      </TouchableOpacity>

      {/* Modals */}
      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addressList={addressList}
        selectedAddress={selectedAddress}
        onSelectAddress={handleAddressSelect}
        onAddressAdded={handleAddressAdded}
        provinces={provinces}
        districts={districts}
        wards={wards}
        selectedProvince={selectedProvince}
        selectedDistrict={selectedDistrict}
        selectedWard={selectedWard}
        setSelectedProvince={setSelectedProvince}
        setSelectedDistrict={setSelectedDistrict}
        setSelectedWard={setSelectedWard}
      />

      <PayCardModal
        visible={showCardModal}
        onClose={() => setShowCardModal(false)}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
      />

      <VnPayModal
        visible={showVnPayModal}
        orderId={vnpayData?.orderId}
        amount={vnpayData?.amount}
        orderInfo={vnpayData?.orderInfo}
        onClose={handleVnPayClose}
      />

      <PayStatusModal
        visible={payStatus !== null}
        status={payStatus}
        onClose={() => setPayStatus(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  section: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  addressText: {
    fontSize: 14,
    marginTop: 4,
  },
  noAddressText: {
    fontSize: 14,
    color: "#999",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginVertical: 4,
  },
  selectedService: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  serviceDesc: {
    fontSize: 12,
    color: "#666",
  },
  voucherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    marginVertical: 8,
    borderRadius: 8,
  },
  voucherRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherText: {
    marginRight: 8,
    color: "#666",
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginVertical: 4,
  },
  selectedPayment: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  summaryContainer: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginTop: 8,
    paddingTop: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  discountText: {
    color: "#e74c3c",
  },
  orderButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // PayScreen styles
  voucherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginVertical: 4,
  },
  voucherText: {
    color: "#2979ff",
    fontWeight: "bold",
  },
});
