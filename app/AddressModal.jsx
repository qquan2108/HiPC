import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/AxiosInstance";

const GHN_TOKEN = "08749195-4da3-11f0-bf1c-e283f3defbd9";
const GHN_SHOP_ID = "196957";
const SHOP_DISTRICT_ID = 1461; // Mã quận/huyện của shop

export default function AddressModal({
  visible, addressList, setAddressList, selectedAddress, setSelectedAddress, onClose
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Lấy danh sách tỉnh khi mở modal
  useEffect(() => {
    if (showAdd) {
      fetchProvinces();
    }
  }, [showAdd]);

  const fetchProvinces = async () => {
    const res = await axiosInstance.post(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
      {},
      { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
    );
    setProvinces(res.data.data || []);
  };

  const fetchDistricts = async (provinceId) => {
    const res = await axiosInstance.post(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
      { province_id: Number(provinceId) },
      { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
    );
    setDistricts(res.data.data || []);
  };

  const fetchWards = async (districtId) => {
    const res = await axiosInstance.post(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
      { district_id: Number(districtId) },
      { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
    );
    setWards(res.data.data || []);
  };

  const handleAdd = async () => {
    const userStr = await AsyncStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const res = await axiosInstance.post(`/users/${user.id || user._id}/addresses`, {
      label, address, provinceId, districtId, wardCode
    });
    setAddressList(res.data);
    const def = res.data.find((a) => a.isDefault) || res.data[0];
    setSelectedAddress(def || null);
    setShowAdd(false);
    setLabel("");
    setAddress("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#0005", justifyContent: "center" }}>
        <View style={{ backgroundColor: "#fff", margin: 20, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Sổ địa chỉ</Text>
          <FlatList
            data={addressList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 12,
                  backgroundColor: selectedAddress?.id === item.id ? "#eaf3ff" : "#fff",
                  borderRadius: 8,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: item.provinceId && item.districtId && item.wardCode ? 1 : 0.5
                }}
                onPress={() => {
                  if (item.provinceId && item.districtId && item.wardCode) {
                    setSelectedAddress(item);
                    onClose();
                  } else {
                    Toast.show({
                      type: "error",
                      text1: "Địa chỉ này chưa đủ thông tin để tính phí vận chuyển!",
                      text2: "Vui lòng chọn địa chỉ khác hoặc cập nhật lại."
                    });
                  }
                }}
                disabled={!(item.provinceId && item.districtId && item.wardCode)}
              >
                <Text>
                  {`${item.label}: ${item.address}`}
                  {!(item.provinceId && item.districtId && item.wardCode) && " (thiếu thông tin)"}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    const userStr = await AsyncStorage.getItem("user");
                    if (!userStr) return;
                    const user = JSON.parse(userStr);
                    const res = await axiosInstance.delete(`/users/${user.id || user._id}/addresses/${item.id}`);
                    setAddressList(res.data);
                    const def = res.data.find((a) => a.isDefault) || res.data[0];
                    setSelectedAddress(def || null);
                  }}
                >
                  <Feather name="trash-2" size={18} color="#ff4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
          {showAdd ? (
            <View style={{ backgroundColor: "#f5f6fa", borderRadius: 10, padding: 12, marginTop: 10 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Thêm địa chỉ mới</Text>
              <Text style={{ marginBottom: 2 }}>Tên địa chỉ (Nhà riêng, Công ty...)</Text>
              <TextInput
                placeholder="Tên địa chỉ"
                value={label}
                onChangeText={setLabel}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 6,
                  marginBottom: 10,
                  padding: 8,
                  backgroundColor: "#fff"
                }}
              />
              <Text style={{ marginBottom: 2 }}>Địa chỉ chi tiết</Text>
              <TextInput
                placeholder="Số nhà, tên đường..."
                value={address}
                onChangeText={setAddress}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 6,
                  marginBottom: 10,
                  padding: 8,
                  backgroundColor: "#fff"
                }}
              />
              <Text style={{ marginBottom: 2 }}>Tỉnh/Thành phố</Text>
              <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 6, marginBottom: 10, backgroundColor: "#fff", minHeight: 44 }}>
                <Picker
                  selectedValue={provinceId}
                  onValueChange={(value) => {
                    setProvinceId(value);
                    setDistrictId("");
                    setWardCode("");
                    fetchDistricts(value);
                  }}
                  style={{ color: "#222", height: 44 }}
                  itemStyle={{ color: "#222", fontSize: 16 }}
                >
                  <Picker.Item label="Chọn tỉnh/thành" value="" />
                  {provinces.map((p) => (
                    <Picker.Item key={p.ProvinceID} label={p.ProvinceName} value={p.ProvinceID} />
                  ))}
                </Picker>
              </View>
              <Text style={{ marginBottom: 2 }}>Quận/Huyện</Text>
              <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 6, marginBottom: 10, backgroundColor: "#fff", minHeight: 44 }}>
                <Picker
                  selectedValue={districtId}
                  onValueChange={(value) => {
                    setDistrictId(value);
                    setWardCode("");
                    fetchWards(value);
                  }}
                  enabled={!!provinceId}
                >
                  <Picker.Item label="Chọn quận/huyện" value="" />
                  {districts.map((d) => (
                    <Picker.Item key={d.DistrictID} label={d.DistrictName} value={d.DistrictID} />
                  ))}
                </Picker>
              </View>
              <Text style={{ marginBottom: 2 }}>Phường/Xã</Text>
              <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 6, marginBottom: 16, backgroundColor: "#fff", minHeight: 44 }}>
                <Picker
                  selectedValue={wardCode}
                  onValueChange={setWardCode}
                  enabled={!!districtId}
                >
                  <Picker.Item label="Chọn phường/xã" value="" />
                  {wards.map((w) => (
                    <Picker.Item key={w.WardCode} label={w.WardName} value={w.WardCode} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: (!label || !address || !provinceId || !districtId || !wardCode) ? "#ccc" : "#2979ff",
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center"
                }}
                onPress={async () => {
                  const userStr = await AsyncStorage.getItem("user");
                  if (!userStr) return;
                  const user = JSON.parse(userStr);
                  // Giữ địa chỉ cũ, chỉ thêm mới
                  const res = await axiosInstance.post(`/users/${user.id || user._id}/addresses`, {
                    label, address, provinceId, districtId, wardCode
                  });
                  setAddressList(res.data); // Backend đã trả về toàn bộ danh sách mới
                  const def = res.data.find((a) => a.isDefault) || res.data[0];
                  setSelectedAddress(def || null);
                  setShowAdd(false);
                  setLabel("");
                  setAddress("");
                  setProvinceId("");
                  setDistrictId("");
                  setWardCode("");
                  setDistricts([]);
                  setWards([]);
                }}
                disabled={!label || !address || !provinceId || !districtId || !wardCode}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Thêm địa chỉ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={{ marginTop: 10, alignItems: "center" }}>
                <Text style={{ color: "#2979ff" }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{ marginTop: 10, alignSelf: "flex-end" }}
              onPress={() => setShowAdd(true)}
            >
              <Text style={{ color: "#2979ff", fontWeight: "bold" }}>+ Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ marginTop: 10, alignSelf: "flex-end" }}
            onPress={onClose}
          >
            <Text style={{ color: "#2979ff", fontWeight: "bold" }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}