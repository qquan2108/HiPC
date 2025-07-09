// TikTok-style vertical video feed with enhanced UI and interactive buttons
// Usage: drop demo1.mp4, demo2.mp4, demo3.mp4 in assets folder

import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Video } from 'expo-av';
import { FontAwesome, Entypo, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
const { height, width } = Dimensions.get('window');

const videos = [
  {
    id: '1',
    source: require('../assets/video/demo1.mp4'),
    user: '@tinhlhps',
    avatar: require('../assets/images/avatar.png'),
    description: 'Giới thiệu sản phẩm A',
    song: 'Nhạc nền A',
    likes: 1200,
    comments: 300,
    shares: 80,
  },
  {
    id: '2',
    source: require('../assets/video/demo2.mp4'),
    user: '@tinhlhps',
    avatar: require('../assets/images/avatar.png'),
    description: 'Tính năng nổi bật B',
    song: 'Beat B',
    likes: 890,
    comments: 150,
    shares: 40,
  },
  {
    id: '3',
    source: require('../assets/video/demo3.mp4'),
    user: '@tinhlhps',
    avatar: require('../assets/images/avatar.png'),
    description: 'Màn test sản phẩm C',
    song: 'Tune C',
    likes: 540,
    comments: 90,
    shares: 25,
  },
  {
    id: '4',
    source: require('../assets/video/demo4.mp4'),
    user: '@tinhlhps',
    avatar: require('../assets/images/avatar.png'),
    description: 'Màn test sản phẩm C',
    song: 'Tune C',
    likes: 540,
    comments: 90,
    shares: 25,
  },
  {
    id: '5',
    source: require('../assets/video/demo5.mp4'),
    user: '@tinhlhps',
    avatar: require('../assets/images/avatar.png'),
    description: 'Màn test sản phẩm C',
    song: 'Tune C',
    likes: 540,
    comments: 90,
    shares: 25,
  },
  {
    id: '6',
    source: require('../assets/video/demo6.mp4'),
    user: '@tinhlhps',
    avatar: require('../assets/images/avatar.png'),
    description: 'Màn test sản phẩm C',
    song: 'Tune C',
    likes: 540,
    comments: 90,
    shares: 25,
  },
  {
    id: '7',
    source: require('../assets/video/demo7.mp4'),
    user: '@tinhlhps',
    avatar: require('../assets/images/avatar.png'),
    description: 'Màn test sản phẩm C',
    song: 'Tune C',
    likes: 540,
    comments: 90,
    shares: 25,
  },
];

export default function VideoFeed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentComments, setCurrentComments] = useState([]);
  const [newComment, setNewComment] = useState('');
    const router = useRouter();
  const viewConfig = { viewAreaCoveragePercentThreshold: 80 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const postComment = () => {
    if (newComment.trim()) {
      setCurrentComments(prev => [...prev, newComment.trim()]);
      setNewComment('');
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.page}>
      <Video
        ref={item.ref || (item.ref = React.createRef())}
        source={item.source}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay={index === activeIndex}
        volume={index === activeIndex ? 1.0 : 0.0}
      />

      {/* Bottom Left Overlay */}
      <View style={styles.bottomLeft}>
        <View style={styles.userRow}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person-circle" size={36} color="#fff" />
          </View>
          <Text style={styles.user}>{item.user}</Text>
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.songRow}>
          <Ionicons name="musical-note" size={16} color="#fff" />
          <Text style={styles.song}>{item.song}</Text>
        </View>
      </View>

      {/* Right Action Buttons */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
          <FontAwesome name="heart" size={30} color="#fff" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            setCurrentComments([]);
            setModalVisible(true);
          }}
        >
          <FontAwesome name="commenting" size={28} color="#fff" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
          <Entypo name="share" size={28} color="#fff" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.commentBox}>
            <Text style={styles.modalTitle}>Bình luận</Text>
            <FlatList
              data={currentComments}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <Text style={styles.commentItem}>• {item}</Text>
              )}
              ListEmptyComponent={<Text>Chưa có bình luận nào.</Text>}
              style={{ flex: 1, width: '100%' }}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Viết bình luận..."
                placeholderTextColor="#888"
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={postComment} style={styles.sendBtn}>
                <Text style={styles.sendText}>Gửi</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );

  return (
    <FlatList
      data={videos}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      decelerationRate="fast"
      viewabilityConfig={viewConfig}
      onViewableItemsChanged={onViewableItemsChanged}
    />
  );
}

const styles = StyleSheet.create({
  page: { width, height, backgroundColor: '#000' },
  video: { position: 'absolute', width, height },

  bottomLeft: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 100,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatarWrapper: {
    marginRight: 8,
  },
  user: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  description: { color: '#fff', fontSize: 14, marginBottom: 8 },
  songRow: { flexDirection: 'row', alignItems: 'center' },
  song: { color: '#fff', fontSize: 14, marginLeft: 4 },

  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    marginBottom: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  actionText: { color: '#fff', fontSize: 12, marginTop: 4 },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentBox: {
    height: height * 0.5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  commentItem: { fontSize: 14, marginVertical: 4 },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 8,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendText: { color: '#fff', fontWeight: '600' },
  closeBtn: { marginTop: 12 },
  closeText: { color: '#007AFF' },
});