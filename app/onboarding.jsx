import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const slides = [
  {
    id: '1',
    title: 'Choose Products',
    description: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.',
    image: require('../assets/images/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Make Payment',
    description: 'Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt.',
    image: require('../assets/images/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Get Your Order',
    description: 'Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt.',
    image: require('../assets/images/onboarding3.png'),
  },
];

const { width, height } = Dimensions.get('window');

const Onboarding = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/LoginScreen');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    router.replace('/LoginScreen');
  };

  const slide = slides[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageCount}>{`${currentIndex + 1}/${slides.length}`}</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Content */}
      <View style={styles.content}>
        <Image source={slide.image} style={styles.image} />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.text}>{slide.description}</Text>
      </View>

      {/* Footer (fixed) */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
          <Text style={[styles.footerText, currentIndex === 0 && styles.disabledText]}>Prev</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.footerText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pageCount: {
    fontSize: 16,
    color: '#000',
  },
  skip: {
    color: 'gray',
    fontSize: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: '80%',
    maxWidth: 320,
    height: height * 0.3,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  footerText: {
    fontSize: 16,
    color: '#f00',
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
});
