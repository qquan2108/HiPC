import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, TouchableOpacity, View } from 'react-native';

export default function UserInfoHeader({
  edit,
  isUploading,
  form,
  pickImage,
  DEFAULT_BANNER,
  DEFAULT_AVATAR,
  computeSource,
}) {
  return (
    <View style={{ position: 'relative', height: 180, marginBottom: 60, zIndex: 1 }}>
      <TouchableOpacity
   activeOpacity={0.7}
   disabled={!edit}
   onPress={edit ? () => pickImage('bannerUrl') : undefined}
 >
        <Image
          source={computeSource(form.bannerUrl, DEFAULT_BANNER)}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={{
          position: 'absolute', top: 10, right: 10,
          backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 20, zIndex: 2
        }}>
          <MaterialCommunityIcons name="image-plus" size={28} color="#fff" />
        </View>
      </TouchableOpacity>
      <View style={{
        position: 'absolute', bottom: -40, left: 20,
        width: 80, height: 80, borderRadius: 40,
        overflow: 'hidden', borderWidth: 2, borderColor: '#fff',
        backgroundColor: '#eee', zIndex: 3, elevation: 5
      }}>
        <TouchableOpacity onPress={() => pickImage('avatarUrl')}>
          <Image
            source={computeSource(form.avatarUrl, DEFAULT_AVATAR)}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View style={{
            position: 'absolute', bottom: 0, right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 12, zIndex: 4
          }}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}