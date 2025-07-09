import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const router = useRouter();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const brandNameOpacity = useRef(new Animated.Value(0)).current;
  const brandNameScale = useRef(new Animated.Value(0.8)).current;
  const brandNameTranslateY = useRef(new Animated.Value(50)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(30)).current;

  const particleAnimations = useRef(
    [...Array(12)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const ringAnimations = useRef(
    [...Array(4)].map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const breathingAnimation = useRef(new Animated.Value(0)).current;

  const progressWidth = useRef(new Animated.Value(0)).current;
  const loadingDotsOpacity = useRef(new Animated.Value(0)).current;

  const morphScale = useRef(new Animated.Value(1)).current;
  const morphOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createSophisticatedAnimation = () => {
      // Phase 1: Background
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }).start();

      // Phase 2: Ripple rings
      setTimeout(() => {
        const ringSequence = ringAnimations.map((ring, index) =>
          Animated.sequence([
            Animated.delay(index * 150),
            Animated.parallel([
              Animated.timing(ring.scale, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(ring.opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(ring.rotate, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(ring.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        Animated.parallel(ringSequence).start();
      }, 200);

      // Phase 3: Logo entrance
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.spring(logoRotation, {
            toValue: 1,
            tension: 30,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 600);

      // Phase 4: Breathing glow
      setTimeout(() => {
        const breathingLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(breathingAnimation, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(breathingAnimation, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );
        breathingLoop.start();

        Animated.timing(glowIntensity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 1000);

      // Phase 5: Brand name
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(brandNameScale, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(brandNameOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(brandNameTranslateY, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1200);

      // Phase 6: Tagline
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(taglineTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1600);

      // Phase 7: Particles
      setTimeout(() => {
        const particleSequence = particleAnimations.map((particle, index) =>
          Animated.sequence([
            Animated.delay(index * 100),
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.spring(particle.scale, {
                toValue: 1,
                tension: 50,
                friction: 6,
                useNativeDriver: true,
              }),
              Animated.timing(particle.translateY, {
                toValue: -50 - Math.random() * 100,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.translateX, {
                toValue: (Math.random() - 0.5) * 100,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.rotate, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
        Animated.parallel(particleSequence).start();
      }, 1800);

      // Phase 8: Loading
      setTimeout(() => {
        Animated.timing(loadingDotsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }).start();
      }, 2000);
    };

    createSophisticatedAnimation();

    // Exit → Onboarding
    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(morphScale, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(morphOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.replace('/onboarding');
      });
    }, 4500);

    return () => clearTimeout(exitTimer);
  }, []);

  const logoRotationInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '12deg'],
  });

  const breathingScale = breathingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const breathingGlow = breathingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <Animated.View style={[styles.container, { opacity: morphOpacity, transform: [{ scale: morphScale }] }]}>
        {/* Background */}
        <Animated.View style={[styles.gradientContainer, { opacity: backgroundOpacity }]}>
          <LinearGradient
            colors={['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.meshBackground} />
        </Animated.View>

        {/* Rings */}
        <View style={styles.ringsContainer}>
          {ringAnimations.map((ring, index) => (
            <Animated.View
              key={index}
              style={[
                styles.ring,
                {
                  width: 150 + index * 120,
                  height: 150 + index * 120,
                  borderRadius: (150 + index * 120) / 2,
                  opacity: ring.opacity,
                  transform: [
                    { scale: ring.scale },
                    {
                      rotate: ring.rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Particles */}
        <View style={styles.particlesContainer}>
          {particleAnimations.map((particle, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: width * 0.2 + Math.random() * (width * 0.6),
                  top: height * 0.3 + Math.random() * (height * 0.4),
                  opacity: particle.opacity,
                  transform: [
                    { translateX: particle.translateX },
                    { translateY: particle.translateY },
                    { scale: particle.scale },
                    {
                      rotate: particle.rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoGlow,
                {
                  opacity: glowIntensity,
                  transform: [{ scale: breathingScale }],
                  shadowOpacity: breathingGlow,
                },
              ]}
            />
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

          <Animated.View
            style={[
              styles.brandContainer,
              {
                opacity: brandNameOpacity,
                transform: [
                  { translateY: brandNameTranslateY },
                  { scale: brandNameScale },
                ],
              },
            ]}
          >
            <Text style={styles.brandName}>HIPC</Text>
            <View style={styles.brandUnderline} />
          </Animated.View>

          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslateY }],
              },
            ]}
          >
            <Text style={styles.brandTagline}>Innovation • Excellence • Future</Text>
          </Animated.View>
        </View>

        {/* Loading */}
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingDotsContainer, { opacity: loadingDotsOpacity }]}>
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
            <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
          </Animated.View>

          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <Animated.View style={[styles.copyright, { opacity: taglineOpacity }]}>
          <Text style={styles.copyrightText}>© 2024 HIPC. All rights reserved.</Text>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  gradient: { flex: 1 },
  meshBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.1,
    backgroundImage: 'radial-gradient(circle at 25% 25%, #667eea 0%, transparent 50%), radial-gradient(circle at 75% 75%, #764ba2 0%, transparent 50%)',
  },
  ringsContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  particlesContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  },
  content: { alignItems: 'center', zIndex: 10 },
  logoContainer: { position: 'relative', marginBottom: 60 },
  logoGlow: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    top: -35, left: -35,
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 40, elevation: 20,
  },
  logoWrapper: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 25, elevation: 25,
  },
  logo: { width: 90, height: 90, resizeMode: 'contain' },
  brandContainer: { alignItems: 'center', marginBottom: 20 },
  brandName: {
    fontSize: 48, fontWeight: '900', color: '#fff',
    letterSpacing: 12,
    textShadowColor: 'rgba(102, 126, 234, 0.5)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
    marginBottom: 16,
  },
  brandUnderline: {
    width: 80, height: 4, backgroundColor: '#667eea',
    borderRadius: 2,
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 10, elevation: 10,
  },
  taglineContainer: { alignItems: 'center' },
  brandTagline: {
    fontSize: 16, color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300', letterSpacing: 3, textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute', bottom: 120, left: 60, right: 60,
    alignItems: 'center',
  },
  loadingDotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  loadingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#667eea', marginHorizontal: 4, opacity: 0.3 },
  loadingDotDelay1: { animationDelay: '0.2s' },
  loadingDotDelay2: { animationDelay: '0.4s' },
  loadingBar: { height: 2, backgroundColor: 'rgba(102, 126, 234, 0.2)', borderRadius: 1, overflow: 'hidden', width: '100%' },
  loadingProgress: {
    height: '100%', backgroundColor: '#667eea',
    borderRadius: 1,
    shadowColor: '#667eea', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 8, elevation: 10,
  },
  copyright: { position: 'absolute', bottom: 50 },
  copyrightText: { fontSize: 11, color: 'rgba(255, 255, 255, 0.5)', fontWeight: '300', letterSpacing: 1 },
});

export default SplashScreen;