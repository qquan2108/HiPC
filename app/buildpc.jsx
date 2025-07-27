import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function UngDungLapPC() {
  const [loaiCauHinh, setLoaiCauHinh] = useState('gaming');
  const [tongGia, setTongGia] = useState(2850);
  const router = useRouter();

  const cacLoaiCauHinh = [
    {
      id: 'gaming',
      title: 'Cấu Hình Game Thủ',
      subtitle: 'Hiệu Năng Cao',
      icon: '🎮',
      gradient: ['#FF6B6B', '#FF8E53'],
      price: 2850,
    },
    {
      id: 'workstation',
      title: 'Trạm Làm Việc Chuyên Nghiệp',
      subtitle: 'Cho Dân Văn Phòng',
      icon: '💼',
      gradient: ['#4ECDC4', '#44A08D'],
      price: 3200,
    },
    {
      id: 'budget',
      title: 'Cấu Hình Giá Rẻ',
      subtitle: 'Tiết Kiệm, Hiệu Quả',
      icon: '💰',
      gradient: ['#A8EDEA', '#FED6E3'],
      price: 1200,
    },
  ];

  const linhKien = [
    {
      category: 'CPU',
      name: 'Intel Core i7-13700K',
      brand: 'Intel',
      price: '$429',
      icon: '🖥️',
      specs: '16 nhân, xung cơ bản 3.4GHz',
    },
    {
      category: 'GPU',
      name: 'RTX 4070 Ti SUPER',
      brand: 'NVIDIA',
      price: '$799',
      icon: '🎨',
      specs: '16GB GDDR6X',
    },
    {
      category: 'RAM',
      name: 'Corsair Vengeance RGB',
      brand: 'Corsair',
      price: '$189',
      icon: '⚡',
      specs: '32GB DDR5-5600',
    },
    {
      category: 'Ổ cứng',
      name: 'Samsung 980 PRO',
      brand: 'Samsung',
      price: '$149',
      icon: '💾',
      specs: 'SSD NVMe 1TB',
    },
    {
      category: 'Mainboard',
      name: 'ASUS ROG Strix Z790',
      brand: 'ASUS',
      price: '$329',
      icon: '🔧',
      specs: 'ATX, WiFi 6E',
    },
    {
      category: 'Nguồn',
      name: 'Corsair RM850x',
      brand: 'Corsair',
      price: '$159',
      icon: '🔋',
      specs: '850W 80+ Gold',
    },
  ];

  const TheLoaiCauHinh = ({ build, isSelected }) => (
    <TouchableOpacity
      style={[styles.buildCard, isSelected && styles.selectedBuild]}
      onPress={() => {
        setLoaiCauHinh(build.id);
        setTongGia(build.price);
      }}
    >
      <LinearGradient
        colors={build.gradient}
        style={styles.buildGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.buildIcon}>{build.icon}</Text>
        <Text style={styles.buildTitle}>{build.title}</Text>
        <Text style={styles.buildSubtitle}>{build.subtitle}</Text>
        <Text style={styles.buildPrice}>${build.price}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const TheLinhKien = ({ component }) => (
    <View style={styles.componentCard}>
      <View style={styles.componentHeader}>
        <View style={styles.componentIconContainer}>
          <Text style={styles.componentIcon}>{component.icon}</Text>
        </View>
        <View style={styles.componentInfo}>
          <Text style={styles.componentCategory}>{component.category}</Text>
          <Text style={styles.componentName}>{component.name}</Text>
          <Text style={styles.componentSpecs}>{component.specs}</Text>
        </View>
        <View style={styles.componentPriceContainer}>
          <Text style={styles.componentPrice}>{component.price}</Text>
          <Text style={styles.componentBrand}>{component.brand}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

<LinearGradient colors={['#EAF4FF', '#FFFFFF']} style={styles.header}>
  <View style={styles.headerContent}>
    <Text style={styles.logo}>⚡ Trình Lắp PC</Text>
    <Text style={styles.headerSubtitle}>Tự tạo máy tính mơ ước của bạn</Text>
  </View>
</LinearGradient>


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn loại cấu hình</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buildTypesContainer}>
            {cacLoaiCauHinh.map((build) => (
              <TheLoaiCauHinh key={build.id} build={build} isSelected={loaiCauHinh === build.id} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linh kiện đã chọn</Text>
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>Tổng cộng</Text>
              <Text style={styles.totalPrice}>${tongGia}</Text>
            </View>
          </View>

          {linhKien.map((component, index) => (
            <TheLinhKien key={index} component={component} />
          ))}
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.customizeButton}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🔧 Tuỳ chỉnh cấu hình</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.orderButton}>
            <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🛒 Đặt hàng ngay</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Chỉ số hiệu năng</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>🎮</Text>
              <Text style={styles.metricTitle}>Chơi game</Text>
              <Text style={styles.metricScore}>95/100</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>🎬</Text>
              <Text style={styles.metricTitle}>Dựng video</Text>
              <Text style={styles.metricScore}>88/100</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>⚡</Text>
              <Text style={styles.metricTitle}>Tổng thể</Text>
              <Text style={styles.metricScore}>92/100</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB', // nền trắng xanh nhạt
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#EAF4FF',
  },
  headerContent: {
    alignItems: 'center',
    
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#5A7081',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B2A38',
    marginBottom: 15,
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceLabel: {
    fontSize: 12,
    color: '#5A7081',
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  buildTypesContainer: {
    marginBottom: 10,
  },
  buildCard: {
    width: 160,
    height: 140,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  selectedBuild: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  buildGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  buildTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  buildSubtitle: {
    fontSize: 12,
    color: '#F1F1F1',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8,
  },
  buildPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  componentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D0E3F1',
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  componentIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#EAF4FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  componentIcon: {
    fontSize: 24,
  },
  componentInfo: {
    flex: 1,
  },
  componentCategory: {
    fontSize: 12,
    color: '#007BFF',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  componentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B2A38',
    marginBottom: 4,
  },
  componentSpecs: {
    fontSize: 14,
    color: '#5A7081',
  },
  componentPriceContainer: {
    alignItems: 'flex-end',
  },
  componentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B2A38',
    marginBottom: 2,
  },
  componentBrand: {
    fontSize: 12,
    color: '#5A7081',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  customizeButton: {
    marginBottom: 12,
    borderRadius: 15,
    overflow: 'hidden',
  },
  orderButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#D0E3F1',
  },
  metricIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#5A7081',
    marginBottom: 8,
    textAlign: 'center',
  },
  metricScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
});