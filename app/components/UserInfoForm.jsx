import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import AddressForm from "../../compomentSignup/AddressForm";
import UserInfoField from './UserInfoField';

export default function UserInfoForm({
  edit, isUploading, form, setForm,
  user, handleSave, handleCancel, styles,
  provinces, setProvinces, districts, setDistricts, wards, setWards,
  fetchProvinces, fetchDistricts, fetchWards
}) {
  return (
    <>
      <UserInfoField label="Họ & Tên">
        <TextInput
          style={[styles.input, edit && styles.inputEdit]}
          value={form.full_name || ''}
          editable={edit && !isUploading}
          onChangeText={v => setForm(prev => ({ ...prev, full_name: v }))}
          placeholder="Nhập họ và tên"
        />
      </UserInfoField>

      <UserInfoField label="Email">
        <TextInput
          style={styles.input}
          value={form.email || ''}
          editable={false}
          placeholder="Chưa có email"
        />
      </UserInfoField>

      <UserInfoField label="Số điện thoại">
        <TextInput
          style={[styles.input, edit && styles.inputEdit]}
          value={form.phone || ''}
          editable={edit && !isUploading}
          keyboardType="phone-pad"
          onChangeText={v => setForm(prev => ({ ...prev, phone: v }))}
          placeholder="Nhập số điện thoại"
        />
      </UserInfoField>

      {edit && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          </View>

          <AddressForm
            label={form.label} setLabel={v => setForm(f => ({ ...f, label: v }))}
            address={form.address} setAddress={v => setForm(f => ({ ...f, address: v }))}
            provinceId={form.provinceId} setProvinceId={v => setForm(f => ({ ...f, provinceId: v }))}
            districtId={form.districtId} setDistrictId={v => setForm(f => ({ ...f, districtId: v }))}
            wardCode={form.wardCode} setWardCode={v => setForm(f => ({ ...f, wardCode: v }))}
            provinces={provinces} setProvinces={setProvinces}
            districts={districts} setDistricts={setDistricts}
            wards={wards} setWards={setWards}
            fetchProvinces={fetchProvinces}
            fetchDistricts={fetchDistricts}
            fetchWards={fetchWards}
            style={{ marginBottom: 0 }}
          />

          <Text style={styles.helperText}>
            Vui lòng chọn Tỉnh/Quận/Phường chính xác để nhận hàng nhanh hơn.
          </Text>
        </View>
      )}
    </>
  );
}