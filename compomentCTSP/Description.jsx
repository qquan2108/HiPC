import React, { useState } from 'react';
import { View, Text, useWindowDimensions, StyleSheet, TouchableOpacity } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default function ProductDescription({ htmlContent }) {
  const { width } = useWindowDimensions();
  const contentWidth = width - 64; // padding 32 hai bên
  const [isExpanded, setIsExpanded] = useState(false);

  // Chuyển đổi <section> thành <div> để RenderHTML hỗ trợ tốt hơn
  const normalizedHtml = (htmlContent || '').replace(/<(\/?)(section)([^>]*)>/gi, '<$1div$3>');

  // Tạo preview content (giới hạn chiều cao khi chưa expand)
  const previewHtml = isExpanded ? normalizedHtml : normalizedHtml.substring(0, 500) + '...';

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#00b894', '#00cec9']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <Feather name="file-text" size={20} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Mô tả sản phẩm</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.badgeText}>CHI TIẾT</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <View style={[
          styles.htmlContainer,
          !isExpanded && styles.htmlContainerCollapsed
        ]}>
          <RenderHTML
            contentWidth={contentWidth}
            source={{ html: previewHtml }}
            baseStyle={styles.baseText}
            tagsStyles={styles.tags}
          />
          
          {/* Fade overlay when collapsed */}
          {!isExpanded && (
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.9)', '#ffffff']}
              style={styles.fadeOverlay}
              pointerEvents="none"
            />
          )}
        </View>

        {/* Expand/Collapse Button */}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isExpanded ? ['#fd79a8', '#e84393'] : ['#74b9ff', '#0984e3']}
            style={styles.expandButtonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </Text>
            <Feather 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#ffffff" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      


      

      {/* Feature Highlights */}
      <View style={styles.featureHighlights}>
        <View style={styles.featureItem}>
          <LinearGradient
            colors={['#a29bfe', '#6c5ce7']}
            style={styles.featureIcon}
          >
            <Feather name="shield-check" size={12} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.featureText}>Chính hãng 100%</Text>
        </View>
        
        <View style={styles.featureItem}>
          <LinearGradient
            colors={['#fd79a8', '#e84393']}
            style={styles.featureIcon}
          >
            <Feather name="truck" size={12} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.featureText}>Giao hàng nhanh</Text>
        </View>
        
        <View style={styles.featureItem}>
          <LinearGradient
            colors={['#ffeaa7', '#fdcb6e']}
            style={styles.featureIcon}
          >
            <Feather name="award" size={12} color="#ffffff" />
          </LinearGradient>
          <Text style={styles.featureText}>Bảo hành 2 năm</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Content Container
  contentContainer: {
    paddingHorizontal: 20,
    position: 'relative',
  },
  htmlContainer: {
    position: 'relative',
  },
  htmlContainerCollapsed: {
    maxHeight: 200,
    overflow: 'hidden',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  // Expand Button
  expandButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  expandButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  expandButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },

  // Base Text Styles
  baseText: {
    color: '#2d3436',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },

  // HTML Tag Styles
  tags: {
    h1: { 
      fontSize: 22, 
      fontWeight: '800', 
      marginBottom: 16, 
      color: '#2d3436',
      letterSpacing: -0.5,
    },
    h2: { 
      fontSize: 20, 
      fontWeight: '700', 
      marginBottom: 12, 
      color: '#636e72',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 10,
      color: '#74b9ff',
    },
    p: { 
      marginBottom: 12, 
      lineHeight: 26, 
      color: '#636e72',
      textAlign: 'justify',
    },
    strong: { 
      fontWeight: '800', 
      color: '#2d3436' 
    },
    b: {
      fontWeight: '800',
      color: '#2d3436'
    },
    em: {
      fontStyle: 'italic',
      color: '#74b9ff'
    },
    a: { 
      color: '#0984e3', 
      textDecorationLine: 'underline',
      fontWeight: '600'
    },
    ul: { 
      marginVertical: 12, 
      paddingLeft: 20,
      backgroundColor: '#f8f9ff',
      paddingVertical: 8,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#74b9ff',
    },
    ol: {
      marginVertical: 12,
      paddingLeft: 20,
      backgroundColor: '#fff5f5',
      paddingVertical: 8,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#fd79a8',
    },
    li: { 
      marginBottom: 8, 
      color: '#636e72',
      lineHeight: 22,
    },
    blockquote: {
      backgroundColor: '#f8f9ff',
      borderLeftWidth: 4,
      borderLeftColor: '#74b9ff',
      paddingLeft: 16,
      paddingVertical: 12,
      marginVertical: 12,
      borderRadius: 8,
      fontStyle: 'italic',
    },
    img: { 
      width: '100%', 
      height: undefined, 
      aspectRatio: 1.5, 
      marginVertical: 16, 
      borderRadius: 12,
      backgroundColor: '#f8f9ff',
    },
    table: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginVertical: 12,
    },
    td: {
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f3f4',
    },
    th: {
      padding: 8,
      backgroundColor: '#f8f9ff',
      fontWeight: '700',
      color: '#2d3436',
    },
  },

  // Feature Highlights
  featureHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 184, 148, 0.1)',
    marginTop: 16,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 11,
    color: '#636e72',
    fontWeight: '600',
    textAlign: 'center',
  },
});