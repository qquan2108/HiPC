import { Picker } from "@react-native-picker/picker";
import { useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function AddressForm({
  label, setLabel,
  address, setAddress,
  provinceId, setProvinceId,
  districtId, setDistrictId,
  wardCode, setWardCode,
  provinces, setProvinces,
  districts, setDistricts,
  wards, setWards,
  fetchProvinces,
  fetchDistricts,
  fetchWards,
  disabled = false,
  style,
}) {
  // Fetch provinces on mount if chưa có
  useEffect(() => {
    if (provinces?.length === 0 && fetchProvinces) fetchProvinces();
  }, []);

  return (
    <View style={[styles.form, style]}>
      <View style={styles.inputContainer}>
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
          editable={!disabled}
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
              if (v && fetchDistricts) fetchDistricts(v);
            }}
            style={styles.picker}
            enabled={!disabled}
          >
            <Picker.Item label="Chọn tỉnh/thành phố" value="" />
            {provinces?.map((p) => (
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
              if (v && fetchWards) fetchWards(v);
            }}
            style={styles.picker}
            enabled={!!provinceId && !disabled}
          >
            <Picker.Item label="Chọn quận/huyện" value="" />
            {districts?.map((d) => (
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
            enabled={!!districtId && !disabled}
          >
            <Picker.Item label="Chọn phường/xã" value="" />
            {wards?.map((w) => (
              <Picker.Item
                key={w.WardCode}
                label={w.WardName}
                value={w.WardCode}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {},
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
});