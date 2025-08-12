// components/Auth/RegisterPrompt.jsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RegisterPrompt = ({ onPress }) => (
  <View style={styles.container}>
    <View style={styles.promptContainer}>
      <Text style={styles.promptText}>Chưa có tài khoản?</Text>
      <TouchableOpacity 
        onPress={onPress}
        style={styles.registerButton}
        activeOpacity={0.8}
      >
        <Text style={styles.registerText}>Đăng ký ngay</Text>
        <Ionicons 
          name="arrow-forward" 
          size={16} 
          color="#8B5CF6" 
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    </View>
    
    {/* Premium CTA Card */}
    <View style={styles.ctaCard}>
      <View style={styles.ctaContent}>
        <Ionicons name="sparkles" size={20} color="#F59E0B" />
        <Text style={styles.ctaText}>
          Tham gia cộng đồng hơn 1M+ người dùng
        </Text>
      </View>
      <TouchableOpacity 
        onPress={onPress}
        style={styles.ctaButton}
        activeOpacity={0.9}
      >
        <Text style={styles.ctaButtonText}>Bắt đầu miễn phí</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 8,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  promptText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '400',
    marginRight: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  registerText: {
    color: '#8B5CF6',
    fontWeight: '700',
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: 4,
  },
  ctaCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RegisterPrompt;