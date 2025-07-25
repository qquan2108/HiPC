import { Feather, MaterialIcons } from "@expo/vector-icons";
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
  StatusBar,
  Animated,
  ScrollView,
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
  const [userDefaultAddress, setUserDefaultAddress] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      loadUserDefaultAddress();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (showAdd) {
      fetchProvinces();
    }
  }, [showAdd]);

  const loadUserDefaultAddress = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // Tạo địa chỉ mặc định từ thông tin user
        if (user.address || user.phone || user.name) {
          setUserDefaultAddress({
            id: 'user-default',
            label: 'Địa chỉ của tôi',
            address: user.address || 'Chưa cập nhật địa chỉ',
            phone: user.phone || '',
            name: user.name || '',
            isUserDefault: true,
            isDefault: true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user default address:', error);
    }
  };

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
      Toast.show({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải danh sách tỉnh/thành"
      });
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
      setWards([]); // Reset wards when district changes
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải danh sách quận/huyện"
      });
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
      Toast.show({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải danh sách phường/xã"
      });
    }
  };

  const handleAdd = async () => {
    if (!label.trim() || !address.trim() || !provinceId || !districtId || !wardCode) {
      Toast.show({ 
        type: "error", 
        text1: "Thông tin chưa đầy đủ",
        text2: "Vui lòng điền đầy đủ thông tin địa chỉ" 
      });
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        Toast.show({
          type: "error",
          text1: "Lỗi xác thực",
          text2: "Vui lòng đăng nhập lại"
        });
        return;
      }

      const user = JSON.parse(userStr);
      const res = await axiosInstance.post(
        `/users/${user.id || user._id}/addresses`, 
        { label: label.trim(), address: address.trim(), provinceId, districtId, wardCode } 
      ); 
      const newAddress = res.data; 
      
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã thêm địa chỉ mới"
      });

      onAddressAdded(newAddress); 
      resetForm();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Lỗi thêm địa chỉ",
        text2: "Vui lòng thử lại sau"
      });
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
      
      Toast.show({
        type: "success",
        text1: "Đã xóa",
        text2: "Địa chỉ đã được xóa thành công"
      });

      const def = addresses.find((a) => a.isDefault) || addresses[0] || userDefaultAddress;
      onAddressAdded(def);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Lỗi xóa địa chỉ",
        text2: "Vui lòng thử lại sau"
      });
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

  const getAddressIcon = (item) => {
    if (item.isUserDefault) return "account-circle";
    if (item.isDefault) return "home";
    return "location-on";
  };

  const getAddressTypeText = (item) => {
    if (item.isUserDefault) return "Địa chỉ cá nhân";
    if (item.isDefault) return "Mặc định";
    return "";
  };

  // Combine user default address with other addresses
  const allAddresses = [
    ...(userDefaultAddress ? [userDefaultAddress] : []),
    ...(addressList || [])
  ];

  const renderAddressItem = ({ item }) => {
    const isValid = item.isUserDefault || (item.provinceId && item.districtId && item.wardCode);
    const isSelected = selectedAddress?.id === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.addressItem,
          isSelected && styles.selectedAddressItem,
          !isValid && styles.invalidAddressItem,
        ]}
        onPress={() => {
          if (isValid) {
            onSelectAddress(item);
            onClose();
          } else {
            Toast.show({
              type: "error",
              text1: "Địa chỉ không hợp lệ",
              text2: "Vui lòng cập nhật hoặc chọn địa chỉ khác",
            });
          }
        }}
        disabled={!isValid}
        activeOpacity={0.7}
      >
        <View style={styles.addressContent}>
          <View style={styles.addressHeader}>
            <View style={styles.addressTitleRow}>
              <MaterialIcons 
                name={getAddressIcon(item)} 
                size={20} 
                color={isSelected ? "#007AFF" : "#666"} 
              />
              <Text style={[styles.addressLabel, isSelected && styles.selectedText]}>
                {item.label}
              </Text>
              {(item.isDefault || item.isUserDefault) && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>
                    {getAddressTypeText(item)}
                  </Text>
                </View>
              )}
            </View>
            {!item.isUserDefault && (
              <TouchableOpacity 
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Feather name="trash-2" size={16} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.addressText, !isValid && styles.invalidText]}>
            {item.address}
          </Text>
          {item.phone && (
            <Text style={styles.phoneText}>
              <Feather name="phone" size={12} color="#666" /> {item.phone}
            </Text>
          )}
        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={20} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0]
                })
              }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Sổ địa chỉ</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Address List */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <FlatList
              data={allAddresses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAddressItem}
              style={styles.list}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Add New Address Form */}
            {showAdd && (
              <View style={styles.addForm}>
                <View style={styles.formHeader}>
                  <MaterialIcons name="add-location" size={24} color="#007AFF" />
                  <Text style={styles.formTitle}>Thêm địa chỉ mới</Text>
                  <TouchableOpacity onPress={resetForm} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Hủy</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Tên địa chỉ *</Text>
                  <TextInput
                    placeholder="Ví dụ: Nhà riêng, Văn phòng..."
                    value={label}
                    onChangeText={setLabel}
                    style={styles.textInput}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Địa chỉ chi tiết *</Text>
                  <TextInput
                    placeholder="Số nhà, tên đường..."
                    value={address}
                    onChangeText={setAddress}
                    style={[styles.textInput, styles.multilineInput]}
                    multiline
                    numberOfLines={2}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.inputLabel}>Tỉnh/Thành phố *</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={provinceId}
                      onValueChange={(v) => {
                        setProvinceId(v);
                        setDistrictId("");
                        setWardCode("");
                        if (v) fetchDistricts(v);
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item label="Chọn tỉnh/thành phố" value="" />
                      {provinces.map((p) => (
                        <Picker.Item
                          key={p.ProvinceID}
                          label={p.ProvinceName}
                          value={p.ProvinceID.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.inputLabel}>Quận/Huyện *</Text>
                  <View style={[styles.pickerWrapper, !provinceId && styles.disabledPicker]}>
                    <Picker
                      selectedValue={districtId}
                      onValueChange={(v) => {
                        setDistrictId(v);
                        setWardCode("");
                        if (v) fetchWards(v);
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
                  </View>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.inputLabel}>Phường/Xã *</Text>
                  <View style={[styles.pickerWrapper, !districtId && styles.disabledPicker]}>
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
                  </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Add Button */}
          {!showAdd && (
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={() => setShowAdd(true)}
            >
              <MaterialIcons name="add" size={20} color="#007AFF" />
              <Text style={styles.addNewButtonText}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  separator: {
    height: 12,
  },
  addressItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedAddressItem: {
    borderColor: "#007AFF",
    backgroundColor: "#f8fbff",
  },
  invalidAddressItem: {
    opacity: 0.6,
    backgroundColor: "#f9f9f9",
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  selectedText: {
    color: "#007AFF",
  },
  defaultBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  invalidText: {
    color: "#999",
  },
  phoneText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  addForm: {
    backgroundColor: "#f8f9fa",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 8,
    flex: 1,
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: "#FF3B30",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  multilineInput: {
    height: 60,
    textAlignVertical: "top",
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  disabledPicker: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e8e8e8",
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  addNewButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});