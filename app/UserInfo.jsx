import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import axiosInstance from '../utils/AxiosInstance';
import UserInfoForm from './components/UserInfoForm';
import UserInfoHeader from './components/UserInfoHeader';

// Ảnh mặc định đặt trong assets/images/
const DEFAULT_AVATAR = require('../assets/images/avatar.png');
const DEFAULT_BANNER = require('../assets/images/avatar.png');

// API base URL (cấu hình trong app.json extra.apiBaseUrl)
const API_BASE_URL =
  Constants.manifest?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://api.myserver.com';

// Goong.io API key
const GOONG_API_KEY =
  Constants.manifest?.extra?.goongApiKey ||
  process.env.EXPO_PUBLIC_GOONG_API_KEY ||
  'hl4FpicxhfD14tmhj6c0r8d16Qjcir0rcaErpfjq';

// Hàm tính toán source cho <Image>
const computeSource = (uri, defaultImg) => {
  if (!uri) return defaultImg;
  if (uri.startsWith('data:') || uri.startsWith('file://') || uri.startsWith('content://')) {
   return { uri };
 }
 // Nếu là HTTP/HTTPS, cũng trả về nguyên uri
 if (uri.startsWith('http://') || uri.startsWith('https://')) {
   return { uri };
 }
 // Trường hợp còn lại (đường dẫn relative từ server), ghép với BASE_URL
 return { uri: API_BASE_URL + uri };
};

export default function UserInfo() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const debounceRef = useRef(null);
  const router = useRouter();

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
      const data = res.data;
      setUser(data);
      setForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        latitude: data.latitude,
        longitude: data.longitude,
        avatarUrl: data.avatarUrl || '',
        bannerUrl: data.bannerUrl || '',
        email: data.email || '',
      });
      setAddressInput(data.address || '');
    } catch (err) {
      console.error('Fetch User Error:', err);
      Alert.alert('Lỗi', 'Không lấy được thông tin người dùng');
    }
  };

  // Debounce address input
  useEffect(() => {
    if (!edit) return;
    clearTimeout(debounceRef.current);
    if (addressInput.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchAddressSuggestions(addressInput);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [addressInput, edit]);

  const fetchAddressSuggestions = async (input) => {
    try {
      const resp = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?input=${encodeURIComponent(input)}&api_key=${GOONG_API_KEY}&components=country:VN`
      );
      const data = await resp.json();
      setSuggestions(data.predictions || []);
    } catch (error) {
      console.error('Address suggestions error:', error);
      setSuggestions([]);
    }
  };

  const fetchPlaceDetail = async (placeId) => {
    try {
      const resp = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`
      );
      const json = await resp.json();
      return json.result?.geometry?.location;
    } catch (error) {
      console.error('Place detail error:', error);
      return null;
    }
  };

  const selectSuggestion = async (item) => {
    setAddressInput(item.description);
    setSuggestions([]);
    const loc = await fetchPlaceDetail(item.place_id);
    if (loc) {
      setForm(prev => ({
        ...prev,
        address: item.description,
        latitude: loc.lat,
        longitude: loc.lng,
      }));
    } else {
      Alert.alert('Lỗi', 'Không lấy được tọa độ địa chỉ');
    }
  };

  const pickImage = async (field) => {
    if (!edit) setEdit(true);
  console.log('pickImage called for', field);
    try {
      // Kiểm tra quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Cần quyền truy cập để chọn hình ảnh.');
        return;
      }

      // Hiển thị tùy chọn chọn ảnh từ thư viện hoặc chụp ảnh
      Alert.alert(
        'Chọn ảnh',
        'Bạn muốn chọn ảnh từ đâu?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thư viện', onPress: () => selectImageFromLibrary(field) },
          { text: 'Chụp ảnh', onPress: () => takePicture(field) },
        ]
      );
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const selectImageFromLibrary = async (field) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'avatarUrl' ? [1, 1] : [3, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setForm(prev => ({ ...prev, [field]: imageUri })); // Đã đúng
      }
    } catch (error) {
      console.error('Select image from library error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    }
  };

  const takePicture = async (field) => {
    try {
      // Kiểm tra quyền truy cập camera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Cần quyền truy cập camera để chụp ảnh.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: field === 'avatarUrl' ? [1, 1] : [3, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setForm(prev => ({ ...prev, [field]: imageUri }));
      }
    } catch (error) {
      console.error('Take picture error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: type,
      } );

      const res = await axiosInstance.post('/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      return res.data.url;
    } catch (error) {
      console.error('Upload image error:', error);
      throw new Error('Không thể tải ảnh lên server');
    }
  };

  const handleSave = async () => {
    if (!form.latitude || !form.longitude) {
      return Alert.alert(
        'Địa chỉ chưa hợp lệ',
        'Vui lòng chọn địa chỉ từ gợi ý để đảm bảo chính xác tọa độ.'
      );
    }

    setIsUploading(true);

    try {
      let { avatarUrl, bannerUrl } = form;

      // Upload avatar nếu là file local
      if (avatarUrl && (avatarUrl.startsWith('file://') || avatarUrl.startsWith('content://'))) {
        try {
          avatarUrl = await uploadImage(avatarUrl);
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể tải ảnh đại diện lên server');
          setIsUploading(false);
          return;
        }
      }

      // Upload banner nếu là file local
      if (bannerUrl && (bannerUrl.startsWith('file://') || bannerUrl.startsWith('content://'))) {
        try {
          bannerUrl = await uploadImage(bannerUrl);
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể tải ảnh bìa lên server');
          setIsUploading(false);
          return;
        }
      }

      const payload = {
        full_name: form.full_name?.trim() || '',
        phone: form.phone?.trim() || '',
        address: form.address?.trim() || '',
        latitude: form.latitude,
        longitude: form.longitude,
        avatarUrl: avatarUrl || '',
        bannerUrl: bannerUrl || '',
      };
      await axiosInstance.put(`/users/${user._id}`, payload);
      
      // Cập nhật user state và AsyncStorage
      const updatedUser = { ...user, ...payload };
      setUser(updatedUser);
      setForm(prev => ({ ...prev, ...payload }));
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEdit(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
    } catch (err) {
      console.error('Save user error:', err);
      Alert.alert('Lỗi', 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/users/${user._id}`);
            await AsyncStorage.multiRemove(['token', 'user']);
            router.replace('/LoginScreen');
          } catch (error) {
            console.error('Delete user error:', error);
            Alert.alert('Lỗi', 'Không xóa được tài khoản');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEdit(false);
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        latitude: user.latitude,
        longitude: user.longitude,
        avatarUrl: user.avatarUrl || '',
        bannerUrl: user.bannerUrl || '',
        email: user.email || '',
      });
      setAddressInput(user.address || '');
    }
    setSuggestions([]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Đặt bút chì ở ngoài ScrollView để luôn nổi trên cùng */}
      {!edit && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 16, // Sát mép trên hơn
            right: 16, // Sát mép phải hơn
            zIndex: 100, // Đảm bảo nổi trên mọi thứ
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 6,
            elevation: 4,
          }}
          onPress={() => setEdit(true)}
        >
          <Ionicons name="pencil" size={24} color="#1976ff" />
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <UserInfoHeader
          edit={edit}
          isUploading={isUploading}
          form={form}
          pickImage={pickImage}
          DEFAULT_BANNER={DEFAULT_BANNER}
          DEFAULT_AVATAR={DEFAULT_AVATAR}
          computeSource={computeSource}
        />
        {/* Header actions giữ nguyên */}
        {/* ... */}
        <UserInfoForm
          edit={edit}
          isUploading={isUploading}
          form={form}
          setForm={setForm}
          addressInput={addressInput}
          setAddressInput={setAddressInput}
          suggestions={suggestions}
          selectSuggestion={selectSuggestion}
          user={user}
          handleSave={handleSave}
          handleCancel={handleCancel}
          styles={styles}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Tách component Field để DRY
function Field({ label, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bannerContainer: { position: 'relative', height: 180, marginBottom: 60, zIndex: 1 },
  banner: { width: '100%', height: '100%' },
  editOverlay: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 20, zIndex: 2
  },
  avatarWrapper: {
    position: 'absolute', bottom: -40, left: 20,
    width: 80, height: 80, borderRadius: 40,
    overflow: 'hidden', borderWidth: 2, borderColor: '#fff',
    backgroundColor: '#eee', zIndex: 3, elevation: 5
  },
  avatar: { width: '100%', height: '100%' },
  avatarOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 12, zIndex: 4
  },
  headerInfo: {
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333', flex: 1 },
  headerActions: { flexDirection: 'row' },
  iconBtn: { marginLeft: 12 },
  content: { paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 8,
    padding: 16, marginHorizontal: 20, marginBottom: 12, elevation: 2
  },
  label: { fontSize: 14, fontWeight: '500', color: '#1976ff', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12,
    fontSize: 16, backgroundColor: '#f9f9f9'
  },
  inputEdit: { backgroundColor: '#fff', borderColor: '#1976ff' },
  suggestionBox: {
    backgroundColor: '#fff', marginTop: 4, borderRadius: 6,
    elevation: 3, maxHeight: 150, borderWidth: 1, borderColor: '#e0e0e0'
  },
  suggestionScroll: { maxHeight: 150 },
  suggestionItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  coordText: { marginTop: 6, fontSize: 12, color: '#666' },
  btnRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 16, marginHorizontal: 20
  },
  btnSave: {
    flex: 1, alignItems: 'center',
    padding: 12, backgroundColor: '#1976ff',
    borderRadius: 8, marginRight: 8
  },
  btnCancel: {
    flex: 1, alignItems: 'center',
    padding: 12, backgroundColor: '#eee', borderRadius: 8
  },
  btnDisabled: {
    opacity: 0.6
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});