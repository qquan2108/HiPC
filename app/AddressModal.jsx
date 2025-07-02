import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/AxiosInstance";

const GHN_TOKEN = "08749195-4da3-11f0-bf1c-e283f3defbd9";
const GHN_SHOP_ID = "196957";

export default function AddressModal({
  visible,
  addressList,
  selectedAddress,
  onSelectAddress,
  onAddressAdded,
  onClose,
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

  useEffect(() => {
    if (showAdd) {
      fetchProvinces();
    }
  }, [showAdd]);

  const fetchProvinces = async () => {
    try {
      const res = await axiosInstance.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {},
        { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
      );
      setProvinces(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDistricts = async (pid) => {
    try {
      const res = await axiosInstance.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
        { province_id: Number(pid) },
        { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
      );
      setDistricts(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWards = async (did) => {
    try {
      const res = await axiosInstance.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        { district_id: Number(did) },
        { headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID } }
      );
      setWards(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async () => {
    if (!label || !address || !provinceId || !districtId || !wardCode) {
      Toast.show({ type: "error", text1: "Vui lòng điền đầy đủ thông tin" });
      return;
    }
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await axiosInstance.post(
       `/users/${user.id || user._id}/addresses`, 
       { label, address, provinceId, districtId, wardCode } 
     ); 
     const newAddress = res.data; 
     // Cho parent reload lại toàn bộ, sẽ giữ các địa chỉ cũ và thêm địa chỉ mới 
     onAddressAdded(newAddress); 
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await axiosInstance.delete(
        `/users/${user.id || user._id}/addresses/${id}`
      );
      const addresses = res.data;
      const def = addresses.find((a) => a.isDefault) || addresses[0] || null;
      onAddressAdded(def);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setLabel("");
    setAddress("");
    setProvinceId("");
    setDistrictId("");
    setWardCode("");
    setDistricts([]);
    setWards([]);
    setShowAdd(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Sổ địa chỉ</Text>

          {/* Address List */}
          <FlatList
            data={addressList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  selectedAddress?.id === item.id && styles.selectedItem,
                  !(item.provinceId && item.districtId && item.wardCode) && styles.invalidItem,
                ]}
                onPress={() => {
                  if (item.provinceId && item.districtId && item.wardCode) {
                    onSelectAddress(item);
                    onClose();
                  } else {
                    Toast.show({
                      type: "error",
                      text1: "Địa chỉ chưa đủ thông tin",
                      text2: "Vui lòng cập nhật hoặc chọn địa chỉ khác",
                    });
                  }
                }}
                disabled={!(item.provinceId && item.districtId && item.wardCode)}
              >
                <Text>{`${item.label}: ${item.address}`}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Feather name="trash-2" size={18} color="#ff4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            style={styles.list}
          />

          {/* Add New */}
          {showAdd ? (
            <View style={styles.form}>
              <Text style={styles.label}>Thêm địa chỉ mới</Text>
              <TextInput
                placeholder="Tên địa chỉ"
                value={label}
                onChangeText={setLabel}
                style={styles.input}
              />
              <TextInput
                placeholder="Địa chỉ chi tiết"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
              />
              <Picker
                selectedValue={provinceId}
                onValueChange={(v) => {
                  setProvinceId(v);
                  setDistrictId("");
                  setWardCode("");
                  fetchDistricts(v);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Chọn tỉnh/thành" value="" />
                {provinces.map((p) => (
                  <Picker.Item
                    key={p.ProvinceID}
                    label={p.ProvinceName}
                    value={p.ProvinceID.toString()}
                  />
                ))}
              </Picker>
              <Picker
                selectedValue={districtId}
                onValueChange={(v) => {
                  setDistrictId(v);
                  setWardCode("");
                  fetchWards(v);
                }}
                style={styles.picker}
                enabled={!!provinceId}
              >
                <Picker.Item label="Chọn quận/huyện" value="" />
                {districts.map((d) => (
                  <Picker.Item
                    key={d.DistrictID}
                    label={d.DistrictName}
                    value={d.DistrictID.toString()}
                  />
                ))}
              </Picker>
              <Picker
                selectedValue={wardCode}
                onValueChange={setWardCode}
                style={styles.picker}
                enabled={!!districtId}
              >
                <Picker.Item label="Chọn phường/xã" value="" />
                {wards.map((w) => (
                  <Picker.Item
                    key={w.WardCode}
                    label={w.WardName}
                    value={w.WardCode}
                  />
                ))}
              </Picker>

              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addText}>Lưu địa chỉ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.showAddBtn}
              onPress={() => setShowAdd(true)}
            >
              <Feather name="plus-circle" size={20} />
              <Text style={styles.showAddText}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          )}

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#0005", justifyContent: "center" },
  container: { backgroundColor: "#fff", margin: 20, borderRadius: 12, padding: 16 },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 10 },
  list: { maxHeight: 200, marginBottom: 10 },
  item: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedItem: { backgroundColor: "#eaf3ff" },
  invalidItem: { opacity: 0.5 },
  form: { backgroundColor: "#f5f6fa", borderRadius: 10, padding: 12, marginTop: 10 },
  label: { fontWeight: "bold", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#fff",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  showAddBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  showAddText: { marginLeft: 6 },
  addBtn: {
    backgroundColor: "#2979ff",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "bold" },
  closeBtn: { marginTop: 10, alignSelf: "center" },
  closeText: { color: "#2979ff", fontWeight: "bold" },
});