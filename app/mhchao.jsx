import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onAnimationFinish }) {
  const anim = useRef(null);

  useEffect(() => {
    anim.current?.play();
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        ref={anim}
        source={require('../assets/animations/splash.json')}
        style={styles.lottie}
        loop={false}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottie: {
    width: width * 0.8,
    height: height * 0.8,
  },
});
