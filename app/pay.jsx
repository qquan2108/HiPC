import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import PayCardModal from "../compomentPay/PayCardModal";
import PayProductList from "../compomentPay/PayProductList";
import PayStatusModal from "../compomentPay/PayStatusModal";
import PayVoucherModal from "../compomentPay/PayVoucherModal";
import StripeModal from "../compomentPay/StripeModal";

import axiosInstance from "../utils/AxiosInstance";
import AddressModal from "./AddressModal";

// GHN credentials
const GHN_TOKEN = "08749195-4da3-11f0-bf1c-e283f3defbd9";
const GHN_SHOP_ID = "196957";
const SHOP_DISTRICT_ID = 1461;
const SHOP_WARD_CODE = "21308";
const GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";

// VietQR config
const VIETQR_ACCOUNT = "699496";
const VIETQR_BANK = "MBBank";

const paymentMethods = [
  {
    key: "cod",
    label: "Thanh toán khi nhận hàng",
    icon: "local-shipping",
    iconLib: "MaterialIcons",
    color: "#FF9500"
  },
  {
    key: "sepay",
    label: "Chuyển khoản ngân hàng",
    icon: "account-balance",
    iconLib: "MaterialIcons",
    color: "#34C759"
  },
  
  {
    key: "stripe",
    label: "Thẻ tín dụng/ghi nợ",
    icon: "card",
    iconLib: "Ionicons",
    color: "#6772E5"
  },
];

function formatCurrency(num) {
  return typeof num === "number" ? num.toLocaleString("vi-VN") + " ₫" : "0 ₫";
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
  const [showStripe, setShowStripe] = useState(false);

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
 
  const [orderId, setOrderId] = useState(null);
  const [orderAmount, setOrderAmount] = useState(0);

  const [allDistricts, setAllDistricts] = useState([]);
  const [allWards, setAllWards] = useState([]);

  // Calculations
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalBeforeDiscount = subtotal + shippingFee;
  const discount = selectedVoucher
    ? selectedVoucher.discount_value != null
      ? selectedVoucher.discount_value > 0 &&
        selectedVoucher.discount_value < 100
        ? Math.round((totalBeforeDiscount * selectedVoucher.discount_value) / 100)
        : Math.min(selectedVoucher.discount_value, totalBeforeDiscount)
    : 0
    : 0;

  const [selectedOrderVoucher, setSelectedOrderVoucher] = useState(null);
  const [selectedShippingVoucher, setSelectedShippingVoucher] = useState(null);

  // Tính discount cho đơn hàng
  const orderDiscount = selectedOrderVoucher
    ? selectedOrderVoucher.discount_type === 'percentage'
      ? Math.round((subtotal * selectedOrderVoucher.discount_value) / 100)
      : Math.min(selectedOrderVoucher.discount_value, subtotal)
    : 0;

  // Tính discount cho phí vận chuyển
  const shippingDiscount = selectedShippingVoucher
    ? selectedShippingVoucher.discount_type === 'percentage'
      ? Math.round((shippingFee * selectedShippingVoucher.discount_value) / 100)
      : Math.min(selectedShippingVoucher.discount_value, shippingFee)
    : 0;

  // Tổng phí vận chuyển sau giảm
  const finalShippingFee = Math.max(0, shippingFee - shippingDiscount);

  // Tổng cuối cùng
  const total = Math.max(0, subtotal - orderDiscount + finalShippingFee);

  const totalWeight = products.reduce(
    (sum, p) => sum + (p.weight || 100) * p.quantity,
    0
  );
  console.log('selectedVoucher:', selectedVoucher);
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
    if (!address || !address.districtId) {
      setShippingServices([]);
      setSelectedService(null);
      Toast.show({
        type: "error",
        text1: "Vui lòng tạo địa chỉ đúng tại sổ địa chỉ",
        text2: "Để tính phí giao hàng nhanh",
      });
      return;
    }

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
      const fastService = services.find((s) => s.service_type_id === 5);
      if (!fastService) {
        setShippingServices([]);
        setSelectedService(null);
        Toast.show({
          type: "error",
          text1: "Vui lòng tạo địa chỉ đúng tại sổ địa chỉ",
          text2: "Để tính phí giao hàng nhanh",
        });
      } else {
        setShippingServices([fastService]);
        if (!selectedService) {
          setSelectedService(fastService);
        }
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

  // Calculate shipping fee
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
      const calculatedWeight = Math.max(totalWeight, 50);

      const baseData = {
        service_id: service.service_id,
        service_type_id: service.service_type_id,
        from_district_id: SHOP_DISTRICT_ID,
        from_ward_code: SHOP_WARD_CODE,
        to_district_id: parseInt(address.districtId, 10),
        to_ward_code: address.wardCode,
        insurance_value: selectedPayment === "cod" ? 0 : subtotal,
        cod_money: selectedPayment === "cod" ? total : 0,
      };

      let requestData;
      if (service.service_type_id === 5) {
        requestData = {
          ...baseData,
          weight: calculatedWeight,
          items: products.map((p) => ({
            length: p.length || 20,
            width: p.width || 20,
            height: p.height || 20,
            weight: Math.max(p.weight || 100, 50),
            quantity: p.quantity || 1,
          })),
        };
      } else {
        requestData = {
          ...baseData,
          weight: calculatedWeight,
          length: 20,
          width: 20,
          height: 20,
        };
      }

      const response = await ghnRequest("/v2/shipping-order/fee", requestData);
      const fee = response.data?.total || 0;

      const DISCOUNT_RATE_FAST = 0.5;
      const MAX_FAST_FEE = 70000;

      let adjustedFee = fee;
      if (service.service_type_id === 5) {
        adjustedFee = Math.round(fee * DISCOUNT_RATE_FAST);
        if (adjustedFee > MAX_FAST_FEE) {
          adjustedFee = MAX_FAST_FEE;
        }
      }

      setShippingFee(adjustedFee);
    } catch (error) {
      console.error("Lỗi tính phí vận chuyển:", error);
      setShippingFee(0);
      Toast.show({
        type: "error",
        text1: "Không thể tính phí vận chuyển",
        text2: "Đang sử dụng phí mặc định 0₫",
      });
    }
  };


  const getServiceLabel = (service) => {
    if (!service) return "";
    switch (service.service_type_id) {
      case 5:
        return "Giao hàng nhanh";
      case 2:
        return "Giao hàng chuẩn";
      case 3:
        return "Giao hàng tiết kiệm";
      default:
        return service.service_name || "Không xác định";
    }
  };

  const getServiceIcon = (service) => {
    switch (service.service_type_id) {
      case 5:
        return "flash";
      case 2:
        return "checkmark-circle";
      case 3:
        return "leaf";
      default:
        return "cube";
    }
  };

  const getServiceColor = (service) => {
    switch (service.service_type_id) {
      case 5:
        return "#FF3B30";
      case 2:
        return "#34C759";
      case 3:
        return "#FF9500";
      default:
        return "#8E8E93";
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

      if (user.address) {
        const selfAddr = {
          id: "self",
          // Dành cho PayScreen
          recipientName: user.full_name,
          phoneNumber: user.phone,
          // Dành cho AddressModal
          label: "Địa chỉ của tôi",
          phone: user.phone,
          address: user.address,
          provinceId: user.provinceId,
          districtId: user.districtId,
          wardCode: user.wardCode,
          isDefault: addresses.length === 0,
        };
        if (!addresses.some((a) => a.id === "self")) {
          addresses = [selfAddr, ...addresses];
        }

      }
      setAddressList(addresses);

      const defaultAddr =
        addresses.find(
          (a) => a.isDefault && a.provinceId && a.districtId && a.wardCode
        ) ||
        addresses.find((a) => a.provinceId && a.districtId && a.wardCode) ||
        null;
      setSelectedAddress((cur) => {
        if (cur && addresses.some((a) => a.id === cur.id)) return cur;
        return defaultAddr;
      });
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
    await loadAddresses();
    if (newAddress) {
      setSelectedAddress(newAddress);
    }
    setShowAddressModal(false);
  };

  // Effects// Trong pay.jsx - sửa phần useEffect xử lý selectedProducts
useEffect(() => {
  (async () => {
    if (params.selectedProducts) {
      try {
        const selected = JSON.parse(params.selectedProducts);
        console.log('selectedProducts:', selected); // Thêm dòng này để kiểm tra
        // Đúng: chỉ lấy price đã truyền, không cộng thêm priceDiff
        const productsFixed = selected.map(p => ({
          ...p,
          price: Number(p.price), // Đã là tổng giá
          quantity: Number(p.quantity) || 1,
        }));
        setProducts(productsFixed);
        return;
      } catch { }
    }
    
    // Phần xử lý cart từ AsyncStorage giữ nguyên
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = user.id || user._id;
      const res = await axiosInstance.get(`/cartt/user/${userId}`);
      const products = Array.isArray(res.data.products) ? res.data.products : [];
const items = products.map((item) => ({
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
  cartItemId: item._id, // Để truyền lại khi thanh toán
  variant: item.variant || {},
}));
setProducts(items);
    } catch (err) {
      console.error(err);
    }
  })();
}, []);

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

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      fetchShippingServices(selectedAddress);
    } else {
      setShippingServices([]);
      setSelectedService(null);
      setShippingFee(0);
    }
  }, [selectedAddress]);

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

  // Thêm useEffect để load toàn bộ quận/huyện và phường/xã khi load tỉnh thành
useEffect(() => {
  (async () => {
    try {
      // Lấy tất cả tỉnh
      const provinceRes = await ghnRequest("/master-data/province");
      setProvinces(provinceRes.data || []);

      // Lấy tất cả quận/huyện của tất cả tỉnh
      let allDistrictsArr = [];
      for (const province of provinceRes.data || []) {
        try {
          const districtRes = await ghnRequest("/master-data/district", {
            province_id: province.ProvinceID,
          });
          if (Array.isArray(districtRes.data)) {
            allDistrictsArr = allDistrictsArr.concat(districtRes.data);
          }
        } catch {}
      }
      setAllDistricts(allDistrictsArr);

      // Lấy tất cả phường/xã của tất cả quận/huyện
      let allWardsArr = [];
      for (const district of allDistrictsArr) {
        try {
          const wardRes = await ghnRequest("/master-data/ward", {
            district_id: district.DistrictID,
          });
          if (Array.isArray(wardRes.data)) {
            allWardsArr = allWardsArr.concat(wardRes.data);
          }
        } catch {}
      }
      setAllWards(allWardsArr);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Không lấy được danh sách tỉnh." });
    }
  })();
}, []);

  // Lấy tên tỉnh từ danh sách provinces
  const provinceName = provinces.find(
    p => String(p.ProvinceID) === String(selectedAddress?.provinceId)
  )?.ProvinceName || "";

  // Lấy tên quận từ toàn bộ districts (không chỉ districts của selectedProvince)
  const districtName = allDistricts.find(
    d => String(d.DistrictID) === String(selectedAddress?.districtId)
  )?.DistrictName || "";

  // Lấy tên phường từ toàn bộ wards (tương tự như trên)
  const wardName = allWards.find(
    w => String(w.WardCode) === String(selectedAddress?.wardCode)
  )?.WardName || "";

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
      variant: p.variant || undefined,
    }));

    const orderData = {
      user_id: userId,
      products: productsData,
      total_price: totalBeforeDiscount,
      shippingFee,
      total,
      address: selectedAddress?.address || "",
      paymentMethod: selectedPayment,
      shippingMethod: selectedService?.service_id || null,
      selectedOrderVoucher,      // gửi đúng trường cho voucher đơn hàng
  selectedShippingVoucher,   // gửi đúng trường cho voucher phí vận chuyển
    };

    // Nếu có cartItemId thì truyền selectedProducts (mua từ cart)
    const selectedCartIds = products.map(p => p.cartItemId).filter(Boolean);
    if (selectedCartIds.length > 0) {
      orderData.selectedProducts = selectedCartIds;
    }

    const res = await axiosInstance.post("/orders/checkout", orderData, {
      headers: { "Content-Type": "application/json" },
    });

    // ✅ IMPORTANT: Clean up cart and AsyncStorage immediately after successful order
    await AsyncStorage.removeItem("cart");
setProducts([]);

// ✅ Force reload cart từ server để đồng bộ với backend
try {
  const userStr = await AsyncStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    const userId = user.id || user._id;
    
    // Gọi API để đảm bảo cart được refresh
    await axiosInstance.get(`/cartt/user/${userId}`);
    
    // Set multiple flags để trigger reload ở tất cả screens
    await AsyncStorage.setItem("shouldReloadCart", Date.now().toString());
    await AsyncStorage.setItem("cartUpdated", "1");
  }
} catch (err) {
  console.log("Cart refresh error (non-critical):", err);
}
    // Handle different payment methods
    

    if (selectedPayment === "stripe") {
      setOrderId(res.data.orderId);
      setOrderAmount(total);
      setShowStripe(true);
      return;
    }

    if (selectedPayment === "sepay") {
      router.push({
        pathname: "/VietQRScreen",
        params: {
          acc: VIETQR_ACCOUNT,
          bank: VIETQR_BANK,
          amount: total.toString(),
          des: `${res.data.orderId}`,
          orderId: res.data.orderId,
          total,
          products: JSON.stringify(products),
          address: selectedAddress?.address || "",
          paymentMethod: selectedPayment,
        },
      });
      return;
    }

    // COD payment - immediate success
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
        address: selectedAddress?.address || "",
        paymentMethod: selectedPayment,
      },
    });

  } catch (err) {
    console.error("Checkout error:", err);
    if (err.response) {
      console.error("Checkout error response:", err.response.data);
      console.error("Checkout error status:", err.response.status);
      Toast.show({
        type: "error",
        text1: "Đặt hàng thất bại!",
        text2: err.response.data?.error || err.message || "Vui lòng thử lại.",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Đặt hàng thất bại!",
        text2: err.message || "Vui lòng thử lại.",
      });
    }
    setPayStatus("fail");
  }
};

  const renderIcon = (iconName, iconLib, color, size = 24) => {
    switch (iconLib) {
      case "MaterialIcons":
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case "Ionicons":
        return <Ionicons name={iconName} size={size} color={color} />;
      default:
        return <Feather name={iconName} size={size} color={color} />;
    }
  };

  const totalPrice = products.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Address Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addressCard}
            onPress={() => setShowAddressModal(true)}
          >
            {selectedAddress ? (
              <View style={styles.addressContent}>
                <View style={styles.addressInfo}>
                  {/* Số điện thoại in đậm ở dòng đầu */}
                  <Text style={[styles.addressName, { fontWeight: "bold" }]}>
                    {selectedAddress.phone || selectedAddress.phoneNumber}
                  </Text>
                  {/* Tên địa chỉ (label hoặc recipientName) */}
                  <Text style={styles.addressText}>
                    {selectedAddress.label || selectedAddress.recipientName}
                  </Text>
                  <Text style={styles.addressText}>
                    {selectedAddress.address}
                  </Text>
                  <Text style={styles.addressText}>
                    {wardName && `${wardName}, `}
                    {districtName && `${districtName}, `}
                    {provinceName}
                  </Text>
                </View>
                <View style={styles.addressAction}>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </View>
              </View>
            ) : (
              <View style={styles.addressContent}>
                <View style={styles.addressInfo}>
                  <Text style={styles.noAddressText}>Chọn địa chỉ giao hàng</Text>
                </View>
                <View style={styles.addressAction}>
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Product List */}
        <PayProductList products={products} formatCurrency={formatCurrency} />

        {/* Shipping Services */}
        {shippingServices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="car" size={20} color="#FF9500" />
                <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
              </View>
            </View>

            <View style={styles.servicesList}>
              {shippingServices.map((service, index) => (
                <TouchableOpacity
                  key={service.service_id}
                  style={[
                    styles.serviceCard,
                    selectedService?.service_id === service.service_id && styles.selectedServiceCard,
                    index === shippingServices.length - 1 && { marginBottom: 0 }
                  ]}
                  onPress={() => setSelectedService(service)}
                >
                  <View style={styles.serviceIcon}>
                    <Ionicons
                      name={getServiceIcon(service)}
                      size={20}
                      color={getServiceColor(service)}
                    />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{getServiceLabel(service)}</Text>
                    <Text style={styles.serviceDesc}>{service.short_name}</Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedService?.service_id === service.service_id && styles.radioButtonSelected
                  ]}>
                    {selectedService?.service_id === service.service_id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Voucher Section - Đơn hàng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="ticket" size={20} color="#FF3B30" />
              <Text style={styles.sectionTitle}>Mã giảm giá đơn hàng</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.voucherCard}
            onPress={() => setShowVoucher('order')}
          >
            <View style={styles.voucherIcon}>
              <Ionicons name="pricetag" size={16} color="#FF3B30" />
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherText}>
                {selectedOrderVoucher
                  ? selectedOrderVoucher.discount_type === 'percentage'
                    ? `Giảm ${selectedOrderVoucher.discount_value}%`
                    : `Giảm ${selectedOrderVoucher.discount_value.toLocaleString("vi-VN")} ₫`
                  : "Chọn mã giảm giá đơn hàng"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Voucher Section - Phí vận chuyển */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="ticket" size={20} color="#34C759" />
              <Text style={styles.sectionTitle}>Mã giảm giá phí vận chuyển</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.voucherCard}
            onPress={() => setShowVoucher('shipping')}
          >
            <View style={styles.voucherIcon}>
              <Ionicons name="pricetag" size={16} color="#34C759" />
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherText}>
                {selectedShippingVoucher
                  ? selectedShippingVoucher.discount_type === 'percentage'
                    ? `Giảm ${selectedShippingVoucher.discount_value}%`
                    : `Giảm ${selectedShippingVoucher.discount_value.toLocaleString("vi-VN")} ₫`
                  : "Chọn mã giảm giá phí vận chuyển"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="card" size={20} color="#34C759" />
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            </View>
          </View>

          <View style={styles.paymentList}>
            {paymentMethods.map((method, index) => (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.paymentCard,
                  selectedPayment === method.key && styles.selectedPaymentCard,
                  index === paymentMethods.length - 1 && { marginBottom: 0 }
                ]}
                onPress={() => setSelectedPayment(method.key)}
              >
                <View style={[styles.paymentIcon, { backgroundColor: `${method.color}15` }]}>
                  {renderIcon(method.icon, method.iconLib, method.color, 20)}
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>{method.label}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPayment === method.key && styles.radioButtonSelected
                ]}>
                  {selectedPayment === method.key && (<View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="receipt" size={20} color="#8E8E93" />
              <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {isLoadingShipping ? "Đang tính..." : formatCurrency(shippingFee)}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>
                  -{formatCurrency(discount)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        {/* Order Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.orderButton,
              (!selectedAddress ||
                products.length === 0 ||
                !selectedService ||
                shippingFee <= 0) && styles.orderButtonDisabled
            ]}
            onPress={handleOrder}
            disabled={
              !selectedAddress ||
              products.length === 0 ||
              !selectedService ||
              shippingFee <= 0
            }
          >
            <Text style={styles.orderButtonText}>
              Đặt hàng · {formatCurrency(total)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <AddressModal
        visible={showAddressModal}
        onClose={() => {
          console.log('▶ AddressModal onClose called');
          setShowAddressModal(false);
        }}
        addressList={addressList}
        animationType="slide"
        selectedAddress={selectedAddress}
        onSelectAddress={(address) => {
          console.log('▶ Address selected:', address);
          handleAddressSelect(address);
        }}
        onAddressAdded={(newAddress) => {
          console.log('▶ Address added:', newAddress);
          handleAddressAdded(newAddress);
        }}
      />

      <PayCardModal
        visible={showCardModal}
        onClose={() => setShowCardModal(false)}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
      />

      

      <StripeModal
        visible={showStripe}
        amount={orderAmount}
        orderId={orderId}
        onClose={(result) => {
          setShowStripe(false);
          if (result?.success) {
            Toast.show({
              type: "success",
              text1: "Thanh toán thành công!",
            });
            router.push({
              pathname: "/CheckoutSuccess",
              params: {
                orderId,
                total: orderAmount,
                products: JSON.stringify(products),
                address: selectedAddress?.address || addressText,
                paymentMethod: "stripe",
              },
            });
          } else if (result?.message) {
            Toast.show({
              type: "error",
              text1: "Thanh toán thất bại!",
              text2: result.message,
            });
          }
        }}
      />

      <PayVoucherModal
        visible={!!showVoucher}
        selectedVoucher={showVoucher === 'order' ? selectedOrderVoucher : selectedShippingVoucher}
        setSelectedVoucher={voucher => {
          if (showVoucher === 'order') setSelectedOrderVoucher(voucher);
          else setSelectedShippingVoucher(voucher);
          setShowVoucher(false);
        }}
        setShowVoucher={setShowVoucher}
        orderAmount={showVoucher === 'order' ? subtotal : shippingFee}
        voucherType={showVoucher} // truyền loại để modal lọc voucher phù hợp
        onVoucherApplied={voucher => {
          if (showVoucher === 'order') setSelectedOrderVoucher(voucher);
          else setSelectedShippingVoucher(voucher);
          setShowVoucher(false);
        }}
      />

      <PayStatusModal
        visible={payStatus !== null}
        status={payStatus}
        onClose={() => setPayStatus(null)}
      />

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },

  // Container Styles
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  // Section Styles
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginLeft: 8,
  },

  // Address Styles
  addressCard: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: "#3C3C43",
    lineHeight: 20,
  },
  addressAction: {
    marginLeft: 12,
  },
  noAddressText: {
    fontSize: 16,
    color: "#8E8E93",
  },

  // Service Styles
  servicesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedServiceCard: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  serviceIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 18,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 13,
    color: "#8E8E93",
  },

  // Voucher Styles
  voucherCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  voucherIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 16,
    marginRight: 12,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherText: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "500",
  },

  // Payment Styles
  paymentList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedPaymentCard: {
    backgroundColor: "#E8F5E8",
    borderColor: "#34C759",
  },
  paymentIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },

  // Radio Button Styles
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#C7C7CC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#007AFF",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },

  // Summary Styles
  summaryCard: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#3C3C43",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  discountText: {
    color: "#FF3B30",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
  },

  // Bottom Section Styles
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
    marginTop: 16,
  },
  orderButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  orderButtonDisabled: {
    backgroundColor: "#C7C7CC",
    shadowOpacity: 0,
    elevation: 0,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "right",
    marginTop: 8,
  },
});