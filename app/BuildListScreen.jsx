import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
  SafeAreaView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../utils/AxiosInstance";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get('window');

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
  const router = useRouter();

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
      setBuilds(Array.isArray(res.data) ? res.data : []);
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
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedBuilds([]);
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
      `Bạn có chắc chắn muốn xóa ${selectedBuilds.length} build đã chọn?`,
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
              Alert.alert("Thành công", "Đã xóa build thành công!");
            } catch (err) {
              Alert.alert("Lỗi", err.response?.data?.error || "Không thể xóa build");
            }
          }
        }
      ]
    );
  };

  const createBuildFromPreset = async (preset) => {
    try {
      await axiosInstance.post(`/pcbuild/presets/${preset.id}/create-build`, {
        userId: user._id || user.id,
        buildName: `${preset.name} - ${new Date().toLocaleDateString('vi-VN')}`
      });
      
      Alert.alert("Thành công", "Đã tạo build từ preset!");
      setShowPresetModal(false);
      await loadBuilds();
    } catch (err) {
      Alert.alert("Lỗi", err.response?.data?.error || "Không thể tạo build từ preset");
    }
  };

  const createNewBuild = () => {
    if (!newBuildName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên build");
      return;
    }
    
    setShowCreateModal(false);
    setNewBuildName('');
    // Navigate to build creation screen with name
    router.push(`/buildpc?name=${encodeURIComponent(newBuildName)}`);
  };

  const renderBuildCard = ({ item }) => {
    const isSelected = selectedBuilds.includes(item._id);
    
    return (
      <TouchableOpacity
        style={[styles.buildCard, isSelected && styles.selectedCard]}
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
      >
        <View style={styles.cardContent}>
          {isSelectionMode && (
            <View style={styles.selectionIndicator}>
              <Ionicons 
                name={isSelected ? "checkbox" : "square-outline"} 
                size={24} 
                color={isSelected ? "#4CAF50" : "#ccc"} 
              />
            </View>
          )}
          
          <View style={styles.buildInfo}>
            <Text style={styles.buildName} numberOfLines={1}>
              {item.name || "Build không tên"}
            </Text>
            
            <View style={styles.priceRow}>
              <MaterialIcons name="attach-money" size={16} color="#2979ff" />
              <Text style={styles.buildPrice}>
                {item.total_price?.toLocaleString("vi-VN") || 0} đ
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
              <Text style={styles.buildDate}>
                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>
          
          {!isSelectionMode && (
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={() => showBuildOptions(item)}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const showBuildOptions = (build) => {
    Alert.alert(
      build.name || "Build không tên",
      "Chọn hành động",
      [
        { text: "Xem chi tiết", onPress: () => router.push(`/BuildDetailScreen?id=${build._id}`) },
        { text: "Chỉnh sửa", onPress: () => router.push(`/BuildEditScreen?id=${build._id}`) },
        { text: "Xóa", style: "destructive", onPress: () => deleteSingleBuild(build._id) },
        { text: "Hủy", style: "cancel" }
      ]
    );
  };

  const deleteSingleBuild = (buildId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa build này?",
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
              Alert.alert("Thành công", "Đã xóa build!");
            } catch (err) {
              Alert.alert("Lỗi", err.response?.data?.error || "Không thể xóa build");
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return styles.completedStatus;
      case 'in-progress': return styles.progressStatus;
      default: return styles.draftStatus;
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case 'completed': return styles.completedText;
      case 'in-progress': return styles.progressText;
      default: return styles.draftText;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang thực hiện';
      default: return 'Nháp';
    }
  };

  const renderPresetCard = ({ item }) => (
    <TouchableOpacity
      style={styles.presetCard}
      onPress={() => createBuildFromPreset(item)}
    >
      <View style={styles.presetContent}>
        <View style={[styles.presetIcon, getCategoryStyle(item.category)]}>
          <MaterialIcons name={getCategoryIcon(item.category)} size={24} color="#fff" />
        </View>
        <View style={styles.presetInfo}>
          <Text style={styles.presetName}>{item.name}</Text>
          <Text style={styles.presetDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.presetPrice}>
            Ước tính: {item.estimatedPrice?.toLocaleString("vi-VN") || 0} đ
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'gaming': return styles.gamingCategory;
      case 'work': return styles.workCategory;
      default: return styles.budgetCategory;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'gaming': return 'sports-esports';
      case 'work': return 'work';
      default: return 'savings';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2979ff" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cấu hình của tôi</Text>
          <View style={styles.headerButtons}>
            {isSelectionMode ? (
              <TouchableOpacity style={styles.headerButton} onPress={exitSelectionMode}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.headerButton} onPress={() => setShowCreateModal(true)}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {isSelectionMode && (
          <View style={styles.selectionToolbar}>
            <TouchableOpacity style={styles.toolbarButton} onPress={selectAllBuilds}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.toolbarText}>Chọn tất cả</Text>
            </TouchableOpacity>
            <Text style={styles.selectionCount}>
              {selectedBuilds.length} đã chọn
            </Text>
            <TouchableOpacity 
              style={[styles.toolbarButton, styles.deleteButton]} 
              onPress={deleteSelectedBuilds}
              disabled={selectedBuilds.length === 0}
            >
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.toolbarText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {!builds.length ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="computer" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa có cấu hình nào</Text>
          <Text style={styles.emptyDescription}>
            Tạo cấu hình đầu tiên từ preset hoặc tự thiết kế
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={() => setShowPresetModal(true)}>
            <Text style={styles.createButtonText}>Khám phá Preset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={builds}
          keyExtractor={item => item._id}
          renderItem={renderBuildCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2979ff"]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo cấu hình mới</Text>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => {
                setShowCreateModal(false);
                setShowPresetModal(true);
              }}
            >
              <MaterialIcons name="palette" size={24} color="#2979ff" />
              <Text style={styles.optionText}>Từ Preset có sẵn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setShowCreateModal(false);
                router.push('/BuildCreationScreen');
              }}
            >
              <MaterialIcons name="build" size={24} color="#2979ff" />
              <Text style={styles.optionText}>Tự thiết kế</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preset Modal */}
      <Modal visible={showPresetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.presetModal}>
            <View style={styles.presetHeader}>
              <Text style={styles.presetModalTitle}>Chọn Preset Build</Text>
              <TouchableOpacity onPress={() => setShowPresetModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={presets}
              keyExtractor={item => item.id}
              renderItem={renderPresetCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.presetList}
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
  
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  
  header: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
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
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  
  deleteButton: {
    backgroundColor: "rgba(244,67,54,0.8)",
  },
  
  toolbarText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  
  selectionCount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  
  buildCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  
  selectedCard: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  
  selectionIndicator: {
    marginRight: 12,
  },
  
  buildInfo: {
    flex: 1,
  },
  
  buildName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  
  buildPrice: {
    color: "#2979ff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  
  completedStatus: {
    backgroundColor: "#e8f5e8",
  },
  
  progressStatus: {
    backgroundColor: "#fff3e0",
  },
  
  draftStatus: {
    backgroundColor: "#f3f4f6",
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  
  completedText: {
    color: "#4caf50",
  },
  
  progressText: {
    color: "#ff9800",
  },
  
  draftText: {
    color: "#666",
  },
  
  buildDate: {
    color: "#999",
    fontSize: 12,
  },
  
  moreButton: {
    padding: 8,
    borderRadius: 20,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyDescription: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  
  createButton: {
    backgroundColor: "#2979ff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2979ff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f8faff",
  },
  
  optionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  
  cancelButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
  
  presetModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  
  presetHeader: {
    flexDirection: "row",
    alignItems: "center",
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
  
  presetList: {
    padding: 16,
  },
  
  presetCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  
  presetContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  
  gamingCategory: {
    backgroundColor: "#e91e63",
  },
  
  workCategory: {
    backgroundColor: "#2196f3",
  },
  
  budgetCategory: {
    backgroundColor: "#4caf50",
  },
  
  presetInfo: {
    flex: 1,
  },
  
  presetName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  
  presetDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  
  presetPrice: {
    fontSize: 14,
    color: "#2979ff",
    fontWeight: "600",
  },
});