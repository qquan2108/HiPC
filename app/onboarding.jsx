import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  StatusBar,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const slides = [
  {
    id: '1',
    title: 'Khám Phá Sản Phẩm',
    subtitle: 'Tìm kiếm hoàn hảo',
    description: 'Khám phá hàng ngàn sản phẩm chất lượng cao với công nghệ AI thông minh giúp bạn tìm ra những gì phù hợp nhất.',
    image: require('../assets/images/onboarding1.png'),
    gradient: ['#667eea', '#764ba2'],
    icon: 'search-outline',
  },
  {
    id: '2',
    title: 'Thanh Toán Siêu Tốc',
    subtitle: 'An toàn & tiện lợi',
    description: 'Thanh toán nhanh chóng với nhiều phương thức bảo mật cao. Hỗ trợ ví điện tử, thẻ tín dụng và các công nghệ thanh toán hiện đại.',
    image: require('../assets/images/onboarding2.png'),
    gradient: ['#f093fb', '#f5576c'],
    icon: 'card-outline',
  },
  {
    id: '3',
    title: 'Nhận Hàng Thần Tốc',
    subtitle: 'Giao hàng 24/7',
    description: 'Hệ thống giao hàng thông minh với theo dõi real-time. Cam kết giao hàng nhanh chóng và an toàn đến tay bạn.',
    image: require('../assets/images/onboarding3.png'),
    gradient: ['#4facfe', '#00f2fe'],
    icon: 'rocket-outline',
  },
];

const { width, height } = Dimensions.get('window');

const Onboarding = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateSlideIn();
  }, [currentIndex]);

  const animateSlideIn = () => {
    // Reset animations
    titleAnim.setValue(50);
    descAnim.setValue(30);
    imageAnim.setValue(0.8);
    buttonAnim.setValue(50);

    // Animate elements in sequence
    Animated.stagger(150, [
      Animated.spring(imageAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(descAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      animateSlideOut(() => {
        setCurrentIndex(currentIndex + 1);
      });
    } else {
      animateSlideOut(() => {
        router.replace('/LoginScreen'); // <-- chuyển sang HomeScreen thay vì LoginScreen
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateSlideOut(() => {
        setCurrentIndex(currentIndex - 1);
      });
    }
  };

  const animateSlideOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      scaleAnim.setValue(1);
      fadeAnim.setValue(1);
      callback();
    });
  };

  const handleSkip = () => {
    router.replace('/HomeScreen'); // <-- chuyển sang HomeScreen thay vì LoginScreen
  };

  const handleDotPress = (index) => {
    if (index !== currentIndex) {
      animateSlideOut(() => {
        setCurrentIndex(index);
      });
    }
  };

  const slide = slides[currentIndex];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={slide.gradient[0]} />
      <View style={styles.container}>
        <LinearGradient
          colors={[...slide.gradient, slide.gradient[0] + '40']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.headerLeft}>
              <View style={styles.logoMini}>
                <Ionicons name="diamond" size={20} color="#fff" />
              </View>
              <Text style={styles.pageCount}>
                {String(currentIndex + 1).padStart(2, '0')}/
                {String(slides.length).padStart(2, '0')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skip}>Bỏ qua</Text>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: `${((currentIndex + 1) / slides.length) * 100}%`,
                  }
                ]}
              />
            </View>
          </View>

          {/* Main Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* Icon Badge */}
            <Animated.View 
              style={[
                styles.iconBadge,
                {
                  transform: [
                    { scale: imageAnim },
                    { rotateY: imageAnim.interpolate({
                      inputRange: [0.8, 1],
                      outputRange: ['45deg', '0deg'],
                    })}
                  ],
                }
              ]}
            >
              <Ionicons name={slide.icon} size={32} color="#fff" />
            </Animated.View>

            {/* Image */}
            <Animated.View 
              style={[
                styles.imageContainer,
                {
                  transform: [
                    { scale: imageAnim },
                    { translateY: imageAnim.interpolate({
                      inputRange: [0.8, 1],
                      outputRange: [50, 0],
                    })}
                  ],
                }
              ]}
            >
              <Image source={slide.image} style={styles.image} />
              <View style={styles.imageShadow} />
            </Animated.View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Animated.View
                style={{
                  transform: [{ translateY: titleAnim }],
                  opacity: fadeAnim,
                }}
              >
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <Text style={styles.title}>{slide.title}</Text>
              </Animated.View>

              <Animated.View
                style={{
                  transform: [{ translateY: descAnim }],
                  opacity: fadeAnim,
                }}
              >
                <Text style={styles.description}>{slide.description}</Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: buttonAnim }],
              }
            ]}
          >
            {/* Navigation Dots */}
            <View style={styles.dotsContainer}>
              {slides.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDotPress(index)}
                  style={styles.dotWrapper}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.dot,
                      currentIndex === index && styles.activeDot,
                      {
                        transform: [{
                          scale: currentIndex === index ? 1.2 : 1
                        }]
                      }
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={handlePrev} 
                disabled={currentIndex === 0}
                style={[
                  styles.navButton,
                  styles.prevButton,
                  currentIndex === 0 && styles.disabledButton
                ]}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="chevron-back" 
                  size={24} 
                  color={currentIndex === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleNext}
                style={styles.nextButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {currentIndex === slides.length - 1 ? 'Bắt Đầu' : 'Tiếp Theo'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradientBackground: {
    flex: 1,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    left: -50,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pageCount: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skip: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  image: {
    width: width * 0.7,
    maxWidth: 280,
    height: height * 0.25,
    resizeMode: 'contain',
  },
  imageShadow: {
    position: 'absolute',
    bottom: -20,
    left: '10%',
    right: '10%',
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 100,
    transform: [{ scaleX: 0.8 }],
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: width * 0.85,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dotWrapper: {
    marginHorizontal: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  prevButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  disabledButton: {
    opacity: 0.3,
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default Onboarding;
