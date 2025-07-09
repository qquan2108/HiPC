// app/hipc.jsx
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Animated, 
  StatusBar,
  Dimensions,
  Text 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const router = useRouter();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const brandNameOpacity = useRef(new Animated.Value(0)).current;
  const brandNameTranslateY = useRef(new Animated.Value(30)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0)).current;
  const ringScale2 = useRef(new Animated.Value(0)).current;
  const ringScale3 = useRef(new Animated.Value(0)).current;
  const gradientOpacity = useRef(new Animated.Value(0)).current;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationSequence = () => {
      // Start gradient background
      Animated.timing(gradientOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();

      // Ring animations (ripple effect)
      setTimeout(() => {
        Animated.stagger(200, [
          Animated.timing(ringScale1, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale2, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale3, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);

      // Logo entrance animation
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(logoRotation, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);

      // Brand name animation
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(brandNameOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(brandNameTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);

      // Particle animation
      setTimeout(() => {
        Animated.timing(particleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 1200);
    };

    animationSequence();

    // Navigate to next screen
    const timer = setTimeout(() => {
      // Exit animation before navigation
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(brandNameOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(gradientOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        router.replace('/onboarding');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <View style={styles.container}>
        <Animated.View style={[styles.gradientContainer, { opacity: gradientOpacity }]}>
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Animated Background Rings */}
        <View style={styles.ringsContainer}>
          <Animated.View 
            style={[
              styles.ring, 
              styles.ring1,
              { 
                transform: [{ scale: ringScale1 }],
                opacity: ringScale1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.3, 0],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.ring, 
              styles.ring2,
              { 
                transform: [{ scale: ringScale2 }],
                opacity: ringScale2.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.2, 0],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.ring, 
              styles.ring3,
              { 
                transform: [{ scale: ringScale3 }],
                opacity: ringScale3.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.1, 0],
                }),
              }
            ]} 
          />
        </View>

        {/* Floating Particles */}
        <Animated.View style={[styles.particlesContainer, { opacity: particleOpacity }]}>
          {[...Array(6)].map((_, index) => (
            <View 
              key={index}
              style={[
                styles.particle, 
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  animationDelay: `${index * 200}ms`,
                }
              ]} 
            />
          ))}
        </Animated.View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Container with Glow Effect */}
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  opacity: logoOpacity,
                  transform: [
                    { scale: logoScale },
                    { rotate: logoRotationInterpolate },
                  ],
                },
              ]}
            >
              <Image 
                source={require('../assets/images/logohipc.png')} 
                style={styles.logo} 
              />
            </Animated.View>
          </View>

          {/* Brand Name */}
          <Animated.View
            style={[
              styles.brandContainer,
              {
                opacity: brandNameOpacity,
                transform: [{ translateY: brandNameTranslateY }],
              },
            ]}
          >
            <Text style={styles.brandName}>HIPC</Text>
            <Text style={styles.brandTagline}>Innovation • Excellence • Future</Text>
            <View style={styles.brandUnderline} />
          </Animated.View>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
   style={[
     styles.loadingProgress,
     {
       alignSelf: 'flex-start',       // để scale từ bên trái
       transform: [{ scaleX: logoOpacity }],
     }
   ]}
 />
          </View>
        </View>

        {/* Copyright */}
        <Animated.View 
          style={[
            styles.copyright,
            { opacity: brandNameOpacity }
          ]}
        >
          <Text style={styles.copyrightText}>© 2024 HIPC. All rights reserved.</Text>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  ringsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 1000,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ring1: {
    width: 200,
    height: 200,
  },
  ring2: {
    width: 400,
    height: 400,
  },
  ring3: {
    width: 600,
    height: 600,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -25,
    left: -25,
  },
  logoWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 8,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
    letterSpacing: 2,
    marginBottom: 16,
  },
  brandUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
  },
  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  copyright: {
    position: 'absolute',
    bottom: 40,
  },
  copyrightText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '300',
  },
});

export default SplashScreen;