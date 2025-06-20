import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axiosInstance from '../utils/AxiosInstance';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function UserInfo() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const router = useRouter();

  // Request permissions for image library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Cần quyền truy cập thư viện ảnh để cập nhật avatar và banner.');
      }
    })();
  }, []);

  // Load user from storage
  useEffect(() => {
    AsyncStorage.getItem('user').then(userStr => {
      if (userStr) {
        const u = JSON.parse(userStr);
        fetchUser(u.id || u._id);
      }
    });
  }, []);

  const fetchUser = async (userId) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`);
      setUser(res.data);
      setForm(res.data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không lấy được thông tin người dùng');
    }
  };

  // Pick image for avatar or banner
  const pickImage = async (field) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'avatarUrl' ? [1, 1] : [3, 1],
        quality: 0.7,
      });
      if (!result.canceled) {
        setForm({ ...form, [field]: result.assets[0].uri });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Upload local image and return remote URL
  const uploadImage = async (uri) => {
    const data = new FormData();
    const filename = uri.split('/').pop();
    const typeMatch = /\.(\w+)$/.exec(filename);
    const type = typeMatch ? `image/${typeMatch[1]}` : 'image';
    data.append('file', { uri, name: filename, type });
    const res = await axiosInstance.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  };

  const handleSave = async () => {
    try {
      let avatarUrl = form.avatarUrl;
      let bannerUrl = form.bannerUrl;
      // If local image, upload first
      if (avatarUrl?.startsWith('file://')) {
        avatarUrl = await uploadImage(avatarUrl);
      }
      if (bannerUrl?.startsWith('file://')) {
        bannerUrl = await uploadImage(bannerUrl);
      }
      const payload = { ...form, avatarUrl, bannerUrl };
      await axiosInstance.put(`/users/${user._id}`, payload);
      setUser(payload);
      setForm(payload);
      setEdit(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Cập nhật thất bại');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/users/${user._id}`);
              await AsyncStorage.multiRemove(['token', 'user']);
              router.replace('/LoginScreen');
            } catch (err) {
              Alert.alert('Lỗi', 'Không xóa được tài khoản');
            }
          }
        }
      ]
    );
  };

  if (!user) return <SafeAreaView style={styles.loadingContainer}><Text style={styles.loadingText}>Đang tải...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Banner */}
      <TouchableOpacity activeOpacity={edit ? 0.7 : 1} onPress={() => edit && pickImage('bannerUrl')}>
        <Image source={{ uri: form.bannerUrl || 'https://via.placeholder.com/600x150' }} style={styles.banner} />
        {edit && <View style={styles.editOverlay}><MaterialCommunityIcons name="image-plus" size={28} color="#fff" /></View>}
      </TouchableOpacity>

      {/* Header with Avatar & Actions */}
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => edit && pickImage('avatarUrl')}>
            <Image source={{ uri: form.avatarUrl || 'https://via.placeholder.com/80' }} style={styles.avatar} />
            {edit && <View style={styles.avatarOverlay}><Ionicons name="camera" size={20} color="#fff" /></View>}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{user.full_name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setEdit(!edit)} style={styles.iconBtn}>
            <MaterialCommunityIcons name={edit ? 'close-circle-outline' : 'pencil-outline'} size={24} color="#1976ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <MaterialCommunityIcons name="delete-outline" size={24} color="#ff5252" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Name */}
        <View style={styles.card}>
          <View style={styles.fieldRow}><Ionicons name="person-outline" size={20} color="#1976ff" /><Text style={styles.label}>Họ & Tên</Text></View>
          <TextInput style={[styles.input, edit && styles.inputEdit]} value={form.full_name} editable={edit} onChangeText={v => setForm({ ...form, full_name: v })} />
        </View>
        {/* Email */}
        <View style={styles.card}>
          <View style={styles.fieldRow}><MaterialCommunityIcons name="email-outline" size={20} color="#1976ff" /><Text style={styles.label}>Email</Text></View>
          <TextInput style={styles.input} value={form.email} editable={false} />
        </View>
        {/* Phone */}
        <View style={styles.card}>
          <View style={styles.fieldRow}><Ionicons name="call-outline" size={20} color="#1976ff" /><Text style={styles.label}>Số điện thoại</Text></View>
          <TextInput style={[styles.input, edit && styles.inputEdit]} value={form.phone} editable={edit} keyboardType="phone-pad" onChangeText={v => setForm({ ...form, phone: v })} />
        </View>
        {/* Address */}
        <View style={styles.card}>
          <View style={styles.fieldRow}><Ionicons name="location-outline" size={20} color="#1976ff" /><Text style={styles.label}>Địa chỉ</Text></View>
          <TextInput style={[styles.input, edit && styles.inputEdit]} value={form.address} editable={edit} onChangeText={v => setForm({ ...form, address: v })} />
        </View>

        {edit && (
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave}><Ionicons name="checkmark-outline" size={20} color="#fff" /><Text style={styles.btnText}>Lưu</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={() => { setEdit(false); setForm(user); }}><Ionicons name="close-outline" size={20} color="#555" /><Text style={[styles.btnText, { color: '#555' }]}>Hủy</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#888' },
  banner: { width: '100%', height: 150 },
  editOverlay: { position: 'absolute', top: 60, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 20 },
  headerWrapper: { position: 'absolute', top: 100, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#fff' },
  avatarOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 12, color: '#333' },
  headerActions: { flexDirection: 'row' },
  iconBtn: { marginLeft: 12 },
  content: { padding: 20, paddingTop: 140 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 1 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', marginLeft: 8, color: '#1976ff' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  inputEdit: { backgroundColor: '#fff', borderColor: '#1976ff' },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btnSave: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1976ff', padding: 12, borderRadius: 8, marginRight: 8 },
  btnCancel: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', padding: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 }
});
