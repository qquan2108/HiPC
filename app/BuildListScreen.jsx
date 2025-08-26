import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  TextInput
} from "react-native";
import axiosInstance from "../utils/AxiosInstance";

const { width, height } = Dimensions.get('window');

export default function BuildListScreen() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBuilds, setSelectedBuilds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newBuildName, setNewBuildName] = useState('');
  const [presets, setPresets] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-100);

  const loadBuilds = async () => {
    const userStr = await AsyncStorage.getItem("user");
    if (!userStr) {
      setLoading(false);
      return;
    }
    
    const userData = JSON.parse(userStr);
    setUser(userData);
    const userId = userData._id || userData.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
const res = await axiosInstance.get(`/pcbuild/user/${userId}`);
 const payload = res.data || {};
 setBuilds(Array.isArray(payload) ? payload : (payload.builds || []));
     
      // Animation cho fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Lỗi khi tải builds:', err);
      setBuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPresets = async () => {
    try {
      const res = await axiosInstance.get('/pcbuild/presets');
      setPresets(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải presets:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBuilds();
      loadPresets();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBuilds();
    setRefreshing(false);
  }, []);

  const toggleBuildSelection = (buildId) => {
    if (selectedBuilds.includes(buildId)) {
      setSelectedBuilds(selectedBuilds.filter(id => id !== buildId));
    } else {
      setSelectedBuilds([...selectedBuilds, buildId]);
    }
  };

  const enterSelectionMode = (buildId) => {
    setIsSelectionMode(true);
    setSelectedBuilds([buildId]);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedBuilds([]);
    
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const selectAllBuilds = () => {
    if (selectedBuilds.length === builds.length) {
      setSelectedBuilds([]);
    } else {
      setSelectedBuilds(builds.map(build => build._id));
    }
  };

  const deleteSelectedBuilds = () => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa ${selectedBuilds.length} cấu hình đã chọn?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              if (selectedBuilds.length === 1) {
                await axiosInstance.delete(`/pcbuild/${selectedBuilds[0]}`, {
                  data: { userId: user._id || user.id }
                });
              } else {
                await axiosInstance.delete('/pcbuild/bulk/delete', {
                  data: { buildIds: selectedBuilds, userId: user._id || user.id }
                });
              }
              await loadBuilds();
              exitSelectionMode();
              Alert.alert("Thành công", "Đã xóa cấu hình thành công!");
            } catch (err) {
              Alert.alert("Lỗi", err.response?.data?.error || "Không thể xóa cấu hình");
            }
          }
        }
      ]
    );
  };

  const createBuildFromPreset = async (preset) => {
    try {
      await axiosInstance.post(`/pcbuild/presets/${preset._id}/create-build`, {
        userId: user._id || user.id,
        buildName: `${preset.name} - ${new Date().toLocaleDateString('vi-VN')}`
      });
      
      Alert.alert("Thành công", "Đã tạo cấu hình từ preset!");
      setShowPresetModal(false);
      await loadBuilds();
    } catch (err) {
      Alert.alert("Lỗi", err.response?.data?.error || "Không thể tạo cấu hình từ preset");
    }
  };

  const createNewBuild = () => {
    if (!newBuildName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên cấu hình");
      return;
    }
    
    setShowCreateModal(false);
    setNewBuildName('');
    router.push(`/buildpc?name=${encodeURIComponent(newBuildName)}`);
  };

  const showBuildOptions = (build) => {
    Alert.alert(
      build.name || "Cấu hình không tên",
      "Chọn hành động",
      [
        { text: "Xem chi tiết", onPress: () => router.push(`/BuildDetailScreen?id=${build._id}`) },
        { text: "Chỉnh sửa", onPress: () => router.push(`/BuildEditScreen?id=${build._id}`) },
        { text: "Sao chép", onPress: () => duplicateBuild(build) },
        { text: "Xóa", style: "destructive", onPress: () => deleteSingleBuild(build._id) },
        { text: "Hủy", style: "cancel" }
      ]
    );
  };

  const duplicateBuild = async (build) => {
    try {
      // Logic để sao chép build - có thể implement sau
      Alert.alert("Thông báo", "Tính năng sao chép đang được phát triển");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể sao chép cấu hình");
    }
  };

  const deleteSingleBuild = (buildId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa cấu hình này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`/pcbuild/${buildId}`, {
                data: { userId: user._id || user.id }
              });
              await loadBuilds();
              Alert.alert("Thành công", "Đã xóa cấu hình!");
            } catch (err) {
              Alert.alert("Lỗi", err.response?.data?.error || "Không thể xóa cấu hình");
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'completed': return ['#4CAF50', '#45a049'];
      case 'in-progress': return ['#FF9800', '#f57c00'];
      default: return ['#9E9E9E', '#757575'];
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang thực hiện';
      default: return 'Bản nháp';
    }
  };

  const getPerformanceColor = (price) => {
    if (price > 30000000) return '#4CAF50'; // High-end
    if (price > 15000000) return '#FF9800'; // Mid-range
    return '#2196F3'; // Budget
  };

  const getPerformanceLabel = (price) => {
    if (price > 30000000) return 'High-end';
    if (price > 15000000) return 'Mid-range';
    return 'Budget';
  };

  const getCategoryGradient = (category) => {
    switch (category) {
      case 'gaming': return ['#e91e63', '#ad1457'];
      case 'work': return ['#2196f3', '#1565c0'];
      default: return ['#4caf50', '#388e3c'];
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'gaming': return 'sports-esports';
      case 'work': return 'work';
      default: return 'savings';
    }
  };

  // Filter builds based on search query
  const filteredBuilds = builds.filter(build =>
    build.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    build.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBuildCard = ({ item, index }) => {
    const isSelected = selectedBuilds.includes(item._id);
    
    return (
      <Animated.View 
        style={[
          styles.buildCard, 
          isSelected && styles.selectedCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (isSelectionMode) {
              toggleBuildSelection(item._id);
            } else {
              router.push(`/BuildDetailScreen?id=${item._id}`);
            }
          }}
          onLongPress={() => {
            if (!isSelectionMode) {
              enterSelectionMode(item._id);
            }
          }}
          activeOpacity={0.7}
          style={styles.cardTouchable}
        >
          {/* Selection indicator */}
          {isSelectionMode && (
            <View style={styles.selectionIndicator}>
              <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </View>
            </View>
          )}
          
          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Header Row */}
            <View style={styles.cardHeader}>
              <View style={styles.buildIconContainer}>
                <LinearGradient
                  colors={getStatusGradient(item.status)}
                  style={styles.buildIcon}
                >
                  <MaterialIcons name="computer" size={24} color="#fff" />
                </LinearGradient>
              </View>
              
              <View style={styles.buildMainInfo}>
                <Text style={styles.buildName} numberOfLines={2}>
                  {item.name || "Cấu hình không tên"}
                </Text>
                
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>
              
              {!isSelectionMode && (
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => showBuildOptions(item)}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Price and Stats Row */}
            <View style={styles.cardStats}>
              <View style={styles.priceSection}>
                <MaterialIcons name="attach-money" size={20} color="#2979ff" />
                <Text style={styles.buildPrice}>
                  {(item.total_price || 0).toLocaleString("vi-VN")} đ
                </Text>
              </View>
              
              <View style={styles.dateSection}>
                <MaterialIcons name="schedule" size={16} color="#999" />
                <Text style={styles.buildDate}>
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>
            
            {/* Performance Indicator */}
            <View style={styles.performanceSection}>
              <View style={styles.performanceBar}>
                <View 
                  style={[
                    styles.performanceFill, 
                    { 
                      width: `${Math.min(100, (item.total_price || 0) / 50000000 * 100)}%`,
                      backgroundColor: getPerformanceColor(item.total_price || 0)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.performanceText}>
                {getPerformanceLabel(item.total_price || 0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPresetCard = ({ item }) => (
    <TouchableOpacity
      style={styles.presetCard}
      onPress={() => createBuildFromPreset(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getCategoryGradient(item.category)}
        style={styles.presetGradient}
      >
        <View style={styles.presetContent}>
          <View style={styles.presetIconContainer}>
            <MaterialIcons name={getCategoryIcon(item.category)} size={32} color="#fff" />
          </View>
          
          <View style={styles.presetInfo}>
            <Text style={styles.presetName}>{item.name}</Text>
            <Text style={styles.presetDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.presetPriceContainer}>
              <MaterialIcons name="attach-money" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.presetPrice}>
                {(item.estimatedPrice || 0).toLocaleString("vi-VN")} đ
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Cấu hình của tôi</Text>
          </View>
        </LinearGradient>
        <View style={styles.center}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2979ff" />
            <Text style={styles.loadingText}>Đang tải cấu hình...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Cấu hình của tôi</Text>
            <Text style={styles.headerSubtitle}>
              {builds.length} cấu hình
            </Text>
          </View>
          
          <View style={styles.headerButtons}>
            {isSelectionMode ? (
              <TouchableOpacity style={styles.headerButton} onPress={exitSelectionMode}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={() => setShowSearch(!showSearch)}
                >
                  <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={() => setShowCreateModal(true)}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm cấu hình..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {/* Selection Toolbar */}
        {isSelectionMode && (
          <Animated.View 
            style={[
              styles.selectionToolbar,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <TouchableOpacity style={styles.toolbarButton} onPress={selectAllBuilds}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.toolbarText}>Tất cả</Text>
            </TouchableOpacity>
            
            <View style={styles.selectionCount}>
              <Text style={styles.selectionCountText}>
                {selectedBuilds.length} đã chọn
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.toolbarButton, styles.deleteButton]} 
              onPress={deleteSelectedBuilds}
              disabled={selectedBuilds.length === 0}
            >
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.toolbarText}>Xóa</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>

      {/* Content */}
      {!filteredBuilds.length ? (
        <View style={styles.emptyState}>
          {searchQuery ? (
            // Search empty state
            <View style={styles.emptySearchContainer}>
              <MaterialIcons name="search-off" size={80} color="#ccc" />
              <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
              <Text style={styles.emptyDescription}>
                Không có cấu hình nào phù hợp với "{searchQuery}"
              </Text>
              <TouchableOpacity 
                style={styles.clearSearchButton} 
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchText}>Xóa tìm kiếm</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // No builds empty state
            <View style={styles.emptyContainer}>
              <View style={styles.emptyImageContainer}>
                <LinearGradient
                  colors={['#f0f2f5', '#e1e5e9']}
                  style={styles.emptyImageCircle}
                >
                  <MaterialIcons name="computer" size={60} color="#999" />
                </LinearGradient>
              </View>
              
              <Text style={styles.emptyTitle}>Chưa có cấu hình nào</Text>
              <Text style={styles.emptyDescription}>
                Tạo cấu hình đầu tiên từ preset có sẵn{'\n'}hoặc tự thiết kế theo ý thích
              </Text>
              
              <View style={styles.emptyButtonsContainer}>
                <TouchableOpacity 
                  style={styles.presetButton} 
                  onPress={() => setShowPresetModal(true)}
                >
                  <LinearGradient
                    colors={['#2979ff', '#1565c0']}
                    style={styles.buttonGradient}
                  >
                    <MaterialIcons name="palette" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Khám phá Preset</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.buildButton} 
                  onPress={() => router.push('/buildpc')}
                >
                  <View style={styles.outlineButton}>
                    <MaterialIcons name="build" size={20} color="#2979ff" />
                    <Text style={styles.outlineButtonText}>Tự thiết kế</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredBuilds}
          keyExtractor={item => item._id}
          renderItem={renderBuildCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={["#2979ff"]}
              tintColor="#2979ff"
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Floating Action Button */}
      {!isSelectionMode && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
          <LinearGradient
            colors={['#2979ff', '#1565c0']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Create Modal */}
      <Modal 
        visible={showCreateModal} 
        transparent 
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo cấu hình mới</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => {
                setShowCreateModal(false);
                setShowPresetModal(true);
              }}
            >
              <View style={styles.optionIcon}>
                <MaterialIcons name="palette" size={24} color="#2979ff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Từ Preset có sẵn</Text>
                <Text style={styles.optionDescription}>
                  Chọn từ các mẫu cấu hình được thiết kế sẵn
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setShowCreateModal(false);
                router.push('/buildpc');
              }}
            >
              <View style={styles.optionIcon}>
                <MaterialIcons name="build" size={24} color="#2979ff" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Tự thiết kế</Text>
                <Text style={styles.optionDescription}>
                  Tự do lựa chọn từng linh kiện theo ý thích
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preset Modal */}
      <Modal 
        visible={showPresetModal} 
        transparent 
        animationType="slide"
        onRequestClose={() => setShowPresetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.presetModal}>
            <View style={styles.presetHeader}>
              <View>
                <Text style={styles.presetModalTitle}>Chọn Preset Build</Text>
                <Text style={styles.presetSubtitle}>
                  {presets.length} mẫu có sẵn
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowPresetModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={presets}
              keyExtractor={item => item._id}
              renderItem={renderPresetCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.presetList}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },
  
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  
  header: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 2,
  },
  
  headerButtons: {
    flexDirection: "row",
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  
  selectionToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  
  deleteButton: {
    backgroundColor: "rgba(244,67,54,0.8)",
  },
  
  toolbarText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "600",
  },
  selectionCount: {
    alignItems: "center",
  },
  
  selectionCountText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  
  buildCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  selectedCard: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  
  cardTouchable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  
  selectionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  
  checkedBox: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  
  cardContent: {
    padding: 16,
  },
  
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  
  buildIconContainer: {
    marginRight: 12,
  },
  
  buildIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  
  buildMainInfo: {
    flex: 1,
    paddingRight: 8,
  },
  
  buildName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    lineHeight: 24,
  },
  
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  buildPrice: {
    color: "#2979ff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  buildDate: {
    color: "#999",
    fontSize: 12,
    marginLeft: 4,
  },
  
  performanceSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  performanceBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginRight: 12,
    overflow: "hidden",
  },
  
  performanceFill: {
    height: "100%",
    borderRadius: 3,
  },
  
  performanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    minWidth: 60,
    textAlign: "right",
  },
  
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  
  emptyContainer: {
    alignItems: "center",
    maxWidth: width - 64,
  },
  
  emptySearchContainer: {
    alignItems: "center",
    maxWidth: width - 64,
  },
  
  emptyImageContainer: {
    marginBottom: 24,
  },
  
  emptyImageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  
  emptyButtonsContainer: {
    width: "100%",
  },
  
  presetButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  
  buildButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#2979ff",
    borderRadius: 16,
  },
  
  outlineButtonText: {
    color: "#2979ff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  
  clearSearchButton: {
    backgroundColor: "#2979ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  
  clearSearchText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    borderRadius: 28,
    shadowColor: "#2979ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#f8faff",
    marginTop: 12,
  },
  
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(41, 121, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  
  optionContent: {
    flex: 1,
  },
  
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  
  presetModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  
  presetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  
  presetModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  
  presetSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  
  presetList: {
    padding: 16,
  },
  
  presetCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  presetGradient: {
    padding: 20,
  },
  
  presetContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  presetIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  
  presetInfo: {
    flex: 1,
  },
  
  presetName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  
  presetDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    marginBottom: 8,
  },
  
  presetPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  presetPrice: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginLeft: 4,
  },
});