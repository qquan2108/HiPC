import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
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
  View,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import axiosInstance from '../utils/AxiosInstance';
import UserInfoForm from './components/UserInfoForm';
import provinces from '../assets/data/province.json';
import wards from '../assets/data/ward.json';

const { width } = Dimensions.get('window');

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
 if (uri.startsWith('http://') || uri.startsWith('https://')) {
   return { uri };
 }
 return { uri: API_BASE_URL + uri };
};

// Enhanced Header Component
const EnhancedHeader = ({ 
  edit, 
  isUploading, 
  form, 
  pickImage, 
  computeSource, 
  DEFAULT_BANNER, 
  DEFAULT_AVATAR,
  onEditToggle,
  onSave,
  onCancel,
  router 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.headerContainer}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#1976ff" translucent />
      
      {/* Background Banner */}
      <View style={styles.bannerSection}>
        <TouchableOpacity 
          style={styles.bannerWrapper}
          onPress={() => edit && pickImage('bannerUrl')}
          disabled={!edit || isUploading}
        >
          <Image
            source={computeSource(form.bannerUrl, DEFAULT_BANNER)}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          
          {/* Banner Gradient Overlay */}
          <View style={styles.bannerGradient} />
          
          {/* Banner Edit Button */}
          {edit && (
            <View style={styles.bannerEditButton}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Animated.Text 
          style={[
            styles.navTitle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          Hồ sơ cá nhân
        </Animated.Text>
        
        <View style={styles.navRightActions}>
          {edit ? (
            <>
              <TouchableOpacity 
                style={[styles.navActionButton, styles.saveButton]}
                onPress={onSave}
                disabled={isUploading}
              >
                {isUploading ? (
                  <MaterialIcons name="hourglass-empty" size={20} color="#fff" />
                ) : (
                  <Feather name="check" size={20} color="#fff" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navActionButton, styles.cancelButton]}
                onPress={onCancel}
                disabled={isUploading}
              >
                <Feather name="x" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.navActionButton}
              onPress={onEditToggle}
            >
              <Feather name="edit-3" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Profile Section */}
      <Animated.View 
        style={[
          styles.profileSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => edit && pickImage('avatarUrl')}
          disabled={!edit || isUploading}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={computeSource(form.avatarUrl, DEFAULT_AVATAR)}
              style={styles.avatar}
              resizeMode="cover"
            />
            
            {/* Online Status Indicator */}
            <View style={styles.onlineIndicator} />
            
            {/* Avatar Edit Button */}
            {edit && (
              <View style={styles.avatarEditButton}>
                <MaterialIcons name="photo-camera" size={16} color="#1976ff" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{form.full_name || 'Chưa có tên'}</Text>
          <Text style={styles.userEmail}>{form.email || 'Chưa có email'}</Text>
          
          {/* User Stats */}
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Voucher</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {!edit ? (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryAction]}
                onPress={onEditToggle}
              >
                <Feather name="edit-3" size={18} color="#1976ff" />
                <Text style={styles.primaryActionText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryAction]}
                onPress={() => {/* Share profile */}}
              >
                <Feather name="share-2" size={18} color="#fff" />
                <Text style={styles.secondaryActionText}>Chia sẻ</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.editModeActions}>
              <TouchableOpacity 
                style={[styles.editActionButton, styles.saveActionButton]}
                onPress={onSave}
                disabled={isUploading}
              >
                {isUploading ? (
                  <MaterialIcons name="hourglass-empty" size={18} color="#fff" />
                ) : (
                  <Feather name="check" size={18} color="#fff" />
                )}
                <Text style={styles.editActionText}>
                  {isUploading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editActionButton, styles.cancelActionButton]}
                onPress={onCancel}
                disabled={isUploading}
              >
                <Feather name="x" size={18} color="#666" />
                <Text style={styles.cancelActionText}>Hủy bỏ</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
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

  const fetchAddressSuggestions = (input) => {
    const q = input.trim().toLowerCase(); 
    if (q.length < 3) { 
      setSuggestions([]); 
      return; 
    } 
    const wardList = Array.isArray(wards) ? wards : Object.values(wards); 
    const filtered = wardList 
      .filter(w => w.path.toLowerCase().includes(q)) 
      .slice(0, 10);
    
    setSuggestions(filtered.map(w => ({ 
      description: w.path, 
      provinceId: w.province_id, 
      districtId: w.district_id, 
      wardCode: w.code, 
    }))); 
  };

  const selectSuggestion = (item) => {
    setAddressInput(item.description);
    setSuggestions([]);
    setForm(prev => ({
      ...prev,
      address: item.description,
      provinceId: item.provinceId,
      districtId: item.districtId,
      wardCode: item.wardCode,
    }));
  };

  const pickImage = async (field) => {
    if (!edit) setEdit(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập bị từ chối', 'Cần quyền truy cập để chọn hình ảnh.');
        return;
      }

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
        setForm(prev => ({ ...prev, [field]: imageUri }));
      }
    } catch (error) {
      console.error('Select image from library error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    }
  };

  const takePicture = async (field) => {
    try {
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
      });

      const res = await axiosInstance.post('/users/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      return res.data.url;
    } catch (error) {
      console.error('Upload image error:', error);
      throw new Error('Không thể tải ảnh lên server');
    }
  };

  const handleSave = async () => {
    if (!edit) {
      Alert.alert('Thông báo', 'Bạn cần bật chế độ chỉnh sửa trước khi lưu');
      return;
    }

    setIsUploading(true);

    try {
      let { avatarUrl, bannerUrl } = form;

      if (avatarUrl && (avatarUrl.startsWith('file://') || avatarUrl.startsWith('content://'))) {
        try {
          avatarUrl = await uploadImage(avatarUrl);
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể tải ảnh đại diện lên server');
          setIsUploading(false);
          return;
        }
      }

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
        provinceId: form.provinceId,
        districtId: form.districtId,
        wardCode: form.wardCode,
      };

      await axiosInstance.put(`/users/${user._id}`, payload);
      
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
        <View style={styles.loadingContent}>
          <MaterialIcons name="person" size={48} color="#1976ff" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EnhancedHeader
          edit={edit}
          isUploading={isUploading}
          form={form}
          pickImage={pickImage}
          computeSource={computeSource}
          DEFAULT_BANNER={DEFAULT_BANNER}
          DEFAULT_AVATAR={DEFAULT_AVATAR}
          onEditToggle={() => setEdit(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          router={router}
        />

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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 100,
  },

  loadingContainer: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  loadingContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  // Enhanced Header Styles
  headerContainer: {
    position: 'relative',
    backgroundColor: '#1976ff',
    paddingBottom: 200, // Tăng padding bottom để có đủ không gian cho profile section
    marginBottom: 100, // Tăng marginBottom để form không bị đè
  },

  bannerSection: {
    height: 200, // Giảm chiều cao banner
    position: 'relative',
  },

  bannerWrapper: {
    height: '100%',
    position: 'relative',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e3f2fd',
  },

  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 118, 255, 0.4)',
  },

  bannerEditButton: {
    position: 'absolute',
    top: 15, // Điều chỉnh vị trí
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },

  navigationBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10, // Điều chỉnh cho phù hợp với status bar
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },

  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center',
    flex: 1,
    
  },

  navRightActions: {
    flexDirection: 'row',
    gap: 8,
  },

  navActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },

  cancelButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },

  profileSection: {
    position: 'absolute',
    bottom: -60, // Điều chỉnh vị trí
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  avatarContainer: {
    alignSelf: 'center',
    marginTop: -40,
    marginBottom: 16,
  },

  avatarWrapper: {
    position: 'relative',
    width: 80, // Giảm kích thước avatar
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16, // Giảm kích thước
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },

  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28, // Giảm kích thước
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 16, // Giảm margin
  },

  userName: {
    fontSize: 20, // Giảm kích thước font
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },

  userEmail: {
    fontSize: 14, // Giảm kích thước font
    color: '#7f8c8d',
    marginBottom: 12, // Giảm margin
    textAlign: 'center',
  },

  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10, // Giảm padding
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 18, // Giảm kích thước font
    fontWeight: '700',
    color: '#1976ff',
  },

  statLabel: {
    fontSize: 11, // Giảm kích thước font
    color: '#666',
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 25, // Giảm chiều cao
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12, // Giảm margin
  },

  actionButtonsContainer: {
    gap: 8, // Giảm gap
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Giảm padding
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6, // Giảm gap
  },

  primaryAction: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#1976ff',
  },

  secondaryAction: {
    backgroundColor: '#1976ff',
  },

  primaryActionText: {
    color: '#1976ff',
    fontWeight: '600',
    fontSize: 14, // Giảm kích thước font
  },

  secondaryActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14, // Giảm kích thước font
  },

  editModeActions: {
    gap: 8, // Giảm gap
  },

  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },

  saveActionButton: {
    backgroundColor: '#4caf50',
  },

  cancelActionButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  editActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14, // Giảm kích thước font
  },

  cancelActionText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14, // Giảm kích thước font
  },

  // Form styles (keeping existing ones)
  card: {
    backgroundColor: '#fff', 
    borderRadius: 8,
    padding: 16, 
    marginHorizontal: 20, 
    marginBottom: 12, 
    elevation: 2
  },
  label: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#1976ff', 
    marginBottom: 6 
  },
  input: {
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    borderRadius: 6, 
    paddingVertical: 10, 
    paddingHorizontal: 12,
    fontSize: 16, 
    backgroundColor: '#f9f9f9'
  },
  inputEdit: { 
    backgroundColor: '#fff', 
    borderColor: '#1976ff' 
  },
 suggestionBox: {
   backgroundColor: '#fff', 
   marginTop: 4, 
   borderRadius: 6,
   elevation: 2,
   maxHeight: 200,
 },
 suggestion: {
   padding: 12,
   borderBottomWidth: 1,
   borderBottomColor: '#f0f0f0',
 },
 suggestionText: {
   fontSize: 14,
   color: '#333',
 },
 suggestionLast: {
   borderBottomWidth: 0,
 },
 buttonContainer: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   marginTop: 20,
   marginHorizontal: 20,
   marginBottom: 20,
 },
 button: {
   paddingVertical: 12,
   paddingHorizontal: 24,
   borderRadius: 8,
   minWidth: 100,
   alignItems: 'center',
 },
 saveBtn: {
   backgroundColor: '#4caf50',
 },
 cancelBtn: {
   backgroundColor: '#f44336',
 },
 buttonText: {
   color: '#fff',
   fontSize: 16,
   fontWeight: '600',
 },
 disabledButton: {
   opacity: 0.6,
 },
 uploadingText: {
   color: '#666',
   fontSize: 14,
   textAlign: 'center',
   marginVertical: 10,
 },
});