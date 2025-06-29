import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import UserInfoField from './UserInfoField';

export default function UserInfoForm({
  edit, isUploading, form, setForm,
  addressInput, setAddressInput, suggestions, selectSuggestion,
  user, handleSave, handleCancel, styles
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

      <UserInfoField label="Địa chỉ">
        {edit ? (
          <>
            <TextInput
              style={[styles.input, styles.inputEdit]}
              placeholder="Nhập địa chỉ"
              value={addressInput}
              onChangeText={setAddressInput}
              editable={!isUploading}
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestionBox}>
                <ScrollView style={styles.suggestionScroll} nestedScrollEnabled>
                  {suggestions.map(s => (
                    <TouchableOpacity
                      key={s.place_id}
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(s)}
                      disabled={isUploading}
                    >
                      <Text numberOfLines={2}>{s.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <TextInput
            style={styles.input}
            value={form.address || ''}
            editable={false}
            placeholder="Chưa có địa chỉ"
          />
        )}
        {!edit && form.latitude && form.longitude && (
          <Text style={styles.coordText}>
            Tọa độ: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
          </Text>
        )}
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
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btnSave, isUploading && styles.btnDisabled]}
            onPress={handleSave}
            disabled={isUploading}
          >
            <Text style={styles.btnText}>
              {isUploading ? 'Đang lưu...' : 'Lưu'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnCancel, isUploading && styles.btnDisabled]}
            onPress={handleCancel}
            disabled={isUploading}
          >
            <Text style={[styles.btnText, { color: '#555' }]}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
      {edit && (
        <Text style={{textAlign:'center', color:'#888', marginTop:4}}>
          Nhấn Lưu để xác nhận thay đổi ảnh hoặc thông tin
        </Text>
      )}
    </>
  );
}