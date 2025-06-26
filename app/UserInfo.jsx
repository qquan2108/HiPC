import React, { useEffect, useState, useRef } from 'react';
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
import Constants from 'expo-constants';

export default function UserInfo() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);
  const router = useRouter();
  const GOOGLE_API_KEY = Constants.manifest.extra.googleApiKey;

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
      setAddressInput(res.data.address || '');
    } catch {
      Alert.alert('Lỗi', 'Không lấy được thông tin người dùng');
    }
  };

  // debounce address input for autocomplete
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
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}&components=country:vn`
      );
      const data = await resp.json();
      if (data.status === 'OK') {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  const selectSuggestion = (description) => {
    setAddressInput(description);
    setForm(prev => ({ ...prev, address: description }));
    setSuggestions([]);
  };

  const pickImage = async (field) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập bị từ chối', 'Cần quyền truy cập để chọn hình ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'avatarUrl' ? [1,1] : [3,1],
      quality: 0.7
    });
    if (!result.canceled) {
      setForm(prev => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  const uploadImage = async (uri) => {
    const data = new FormData();
    const filename = uri.split('/').pop();
    const typeMatch = /\.(\w+)$/.exec(filename);
    const type = typeMatch ? `image/${typeMatch[1]}` : 'image';
    data.append('file', { uri, name: filename, type });
    const res = await axiosInstance.post('/upload', data, { headers:{'Content-Type':'multipart/form-data'} });
    return res.data.url;
  };

  const handleSave = async () => {
    try {
      let avatarUrl = form.avatarUrl;
      let bannerUrl = form.bannerUrl;
      if (avatarUrl?.startsWith('file://')) avatarUrl = await uploadImage(avatarUrl);
      if (bannerUrl?.startsWith('file://')) bannerUrl = await uploadImage(bannerUrl);
      const payload = { full_name: form.full_name, phone: form.phone, address: addressInput, ...(avatarUrl && {avatarUrl}), ...(bannerUrl && {bannerUrl}) };
      await axiosInstance.put(`/users/${user._id}`, payload);
      setUser(prev => ({ ...prev, ...payload }));
      setForm(prev => ({ ...prev, ...payload }));
      setEdit(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
    } catch {
      Alert.alert('Lỗi', 'Cập nhật thất bại');
    }
  };

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await axiosInstance.delete(`/users/${user._id}`);
            await AsyncStorage.multiRemove(['token','user']);
            router.replace('/LoginScreen');
          } catch {
            Alert.alert('Lỗi', 'Không xóa được tài khoản');
          }
      }}
    ]);
  };

  if (!user) return <SafeAreaView style={styles.loadingContainer}><Text>Đang tải...</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
      <TouchableOpacity activeOpacity={edit?0.7:1} onPress={()=>edit&&pickImage('bannerUrl')}>
        <Image source={{uri:form.bannerUrl||'https://via.placeholder.com/600x150'}} style={styles.banner}/>
        {edit&&<View style={styles.editOverlay}><MaterialCommunityIcons name="image-plus" size={28} color="#fff"/></View>}
      </TouchableOpacity>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>edit&&pickImage('avatarUrl')}>
            <Image source={{uri:form.avatarUrl||'https://via.placeholder.com/80'}} style={styles.avatar}/>
            {edit&&<View style={styles.avatarOverlay}><Ionicons name="camera" size={20} color="#fff"/></View>}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{user.full_name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={()=>setEdit(!edit)} style={styles.iconBtn}>
            <MaterialCommunityIcons name={edit?'close-circle-outline':'pencil-outline'} size={24} color="#1976ff"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <MaterialCommunityIcons name="delete-outline" size={24} color="#ff5252"/>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}><Text style={styles.label}>Họ & Tên</Text>
          <TextInput style={[styles.input,edit&&styles.inputEdit]} value={form.full_name} editable={edit}
            onChangeText={v=>setForm(prev=>({...prev, full_name:v}))}/>
        </View>
        <View style={styles.card}><Text style={styles.label}>Địa chỉ</Text>
          {edit? <>
            <TextInput style={[styles.input,styles.inputEdit]} placeholder="Nhập địa chỉ"
              value={addressInput} onChangeText={setAddressInput}/>
            {suggestions.map(s=> (
              <TouchableOpacity key={s.place_id} style={styles.suggestion} onPress={()=>selectSuggestion(s.description)}>
                <Text>{s.description}</Text>
              </TouchableOpacity>
            ))}
          </> : <TextInput style={styles.input} value={form.address} editable={false}/>}
        </View>
        <View style={styles.card}><Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email} editable={false}/>
        </View>
        <View style={styles.card}><Text style={styles.label}>Số điện thoại</Text>
          <TextInput style={[styles.input,edit&&styles.inputEdit]} value={form.phone} editable={edit} keyboardType="phone-pad"
            onChangeText={v=>setForm(prev=>({...prev, phone:v}))}/>
        </View>
        {edit&&<View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnSave} onPress={handleSave}><Text style={styles.btnText}>Lưu</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={()=>{setEdit(false);setForm(user);}}><Text style={[styles.btnText,{color:'#555'}]}>Hủy</Text></TouchableOpacity>
        </View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#f2f4f8'},
  loadingContainer:{flex:1,justifyContent:'center',alignItems:'center'},
  banner:{width:'100%',height:150},editOverlay:{position:'absolute',top:60,right:20,backgroundColor:'rgba(0,0,0,0.5)',padding:6,borderRadius:20},
  headerWrapper:{position:'absolute',top:100,left:20,right:20,backgroundColor:'#fff',borderRadius:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:10,elevation:2},
  header:{flexDirection:'row',alignItems:'center'},avatar:{width:80,height:80,borderRadius:40,borderWidth:2,borderColor:'#fff'},avatarOverlay:{position:'absolute',bottom:0,right:0,backgroundColor:'rgba(0,0,0,0.6)',padding:4,borderRadius:12},
  headerTitle:{fontSize:18,fontWeight:'bold',marginLeft:12,color:'#333'},headerActions:{flexDirection:'row'},iconBtn:{marginLeft:12},
  content:{padding:20,paddingTop:140},card:{backgroundColor:'#fff',borderRadius:8,padding:16,marginBottom:12,elevation:1},label:{fontSize:14,fontWeight:'500',color:'#1976ff',marginBottom:6},
  input:{borderWidth:1,borderColor:'#e0e0e0',borderRadius:6,paddingVertical:10,paddingHorizontal:12,fontSize:16,backgroundColor:'#f9f9f9'},inputEdit:{backgroundColor:'#fff',borderColor:'#1976ff'},
  suggestion:{padding:8,borderBottomWidth:1,borderBottomColor:'#eee'},
  btnRow:{flexDirection:'row',justifyContent:'space-between',marginTop:16},btnSave:{flex:1,alignItems:'center',padding:12,backgroundColor:'#1976ff',borderRadius:8,marginRight:8},btnCancel:{flex:1,alignItems:'center',padding:12,backgroundColor:'#eee',borderRadius:8},btnText:{color:'#fff',fontWeight:'bold'}
});
