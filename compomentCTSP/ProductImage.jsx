import React, { useState, useRef } from "react";
import { Image, StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, Text, Animated } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProductImage({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const imageData = images && images.length > 0 
    ? images 
    : [require("../assets/images/pc1.png")];

  // Slide animation when change image
  const handleThumbnailPress = (index) => {
    Animated.timing(slideAnim, {
      toValue: index,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(index);
    });
  };

  return (
    <View style={styles.container}>
      {/* Main Image Display */}
      <View style={styles.imageContainer}>
        <LinearGradient
          colors={['#f8f9ff', '#ffffff', '#f8f9ff']}
          style={styles.gradientBackground}
        >
          <View style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Animated.View
              style={{
                flexDirection: 'row',
                width: width * imageData.length,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, imageData.length - 1],
                    outputRange: [0, -width * (imageData.length - 1)],
                  })
                }]
              }}
            >
              {imageData.map((img, idx) => (
                <View key={idx} style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    source={img}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </Animated.View>
          </View>
          
          {/* Premium Badge */}
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.badgeGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Text style={styles.badgeText}>HD</Text>
            </LinearGradient>
          </View>

          {/* Image Counter */}
          {imageData.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.counterText}>
                {currentIndex + 1}/{imageData.length}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Thumbnail Navigation */}
      {imageData.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
          contentContainerStyle={styles.thumbnailContent}
        >
          {imageData.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                currentIndex === index && styles.activeThumbnail
              ]}
              onPress={() => handleThumbnailPress(index)}
              activeOpacity={0.8}
            >
              <Image
                source={image}
                style={styles.thumbnailImage}
                resizeMode="contain"
              />
              {currentIndex === index && (
                <LinearGradient
                  colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
                  style={styles.thumbnailOverlay}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  gradientBackground: {
    width: '100%',
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mainImage: {
    width: '85%',
    height: '85%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  badgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backdropFilter: 'blur(10px)',
  },
  counterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    marginTop: 16,
  },
  thumbnailContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#f8f9ff',
    marginHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#667eea',
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    zIndex: -1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    zIndex: -1,
  },
});