import React, { useState, useRef } from "react";
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Animated,
  Dimensions,
  Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Banner({ 
  source, 
  onPress, 
  title, 
  subtitle, 
  badge,
  overlayType = 'gradient', // 'gradient', 'none', 'dark'
  showPlayButton = false,
  showFavoriteButton = false,
  cornerRadius = 16,
  aspectRatio = 2.4, // width/height ratio
  animationType = 'scale' // 'scale', 'opacity', 'none'
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setIsPressed(true);
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    } else if (animationType === 'opacity') {
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    } else if (animationType === 'opacity') {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getOverlayGradient = () => {
    switch (overlayType) {
      case 'gradient':
        return ['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'];
      case 'dark':
        return ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.4)'];
      default:
        return ['transparent', 'transparent'];
    }
  };

  const BannerContent = (
    <Animated.View 
      style={[
        styles.bannerContainer, 
        { 
          borderRadius: cornerRadius,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      {/* Main Image */}
      <View style={[styles.imageContainer, { borderRadius: cornerRadius }]}>
        <Image 
          source={source} 
          style={[
            styles.bannerImage, 
            { 
              height: width / aspectRatio,
              borderRadius: cornerRadius 
            }
          ]} 
          resizeMode="cover" 
        />
        
        {/* Overlay Gradient */}
        {overlayType !== 'none' && (
          <LinearGradient
            colors={getOverlayGradient()}
            style={[styles.overlay, { borderRadius: cornerRadius }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        )}

        {/* Shimmer Effect */}
        <View style={[styles.shimmerContainer, { borderRadius: cornerRadius }]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
            style={styles.shimmer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Top Right Buttons */}
        

        {/* Badge */}
        {badge && (
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.badgeText}>{badge}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Play Button */}
        {showPlayButton && (
          <View style={styles.playButtonContainer}>
            <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
                style={styles.playButtonGradient}
              >
                <Ionicons name="play" size={24} color="#333" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Content Overlay */}
        {(title || subtitle) && (
          <View style={styles.contentOverlay}>
            {title && (
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
            
            {/* CTA Button */}
            <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>Khám phá ngay</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Indicators */}
        <View style={styles.bottomIndicators}>
          <View style={styles.indicatorRow}>
            <View style={styles.indicator}>
              <Ionicons name="eye" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.indicatorText}>2.5K</Text>
            </View>
            <View style={styles.indicator}>
              <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.indicatorText}>2 giờ trước</Text>
            </View>
          </View>
        </View>

        {/* Corner Decoration */}
        <View style={styles.cornerDecoration}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.cornerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Glow Effect */}
        {isPressed && (
          <View style={[styles.glowEffect, { borderRadius: cornerRadius }]}>
            <LinearGradient
              colors={['rgba(255,107,107,0.3)', 'transparent']}
              style={styles.glow}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.touchableContainer}
      >
        {BannerContent}
      </TouchableOpacity>
    );
  }

  return BannerContent;
}

const styles = StyleSheet.create({
  touchableContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  bannerContainer: {
    position: 'relative',
    elevation: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  bannerImage: {
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    opacity: 0.3,
  },
  topRightButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  playButton: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    elevation: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomIndicators: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  indicatorText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
  cornerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 24,
    borderLeftWidth: 24,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    overflow: 'hidden',
  },
  cornerGradient: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 24,
    height: 24,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    zIndex: -1,
  },
  glow: {
    flex: 1,
    borderRadius: 20,
  },
});