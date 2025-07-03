// components/Auth/SocialButtons.jsx
import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session'; 
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../utils/firebase';
import axiosInstance from '../utils/AxiosInstance';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const socialIcons = {
  Google: require('../assets/images/Google.png'),
  Apple: require('../assets/images/apple.png'),
  Facebook: require('../assets/images/Facebook.png'),
};

const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
console.log({ redirectUri });

const SocialButtons = () => {
  const router = useRouter();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId:
      '625212493169-ptarfq8gddcsl2q9a6mf0ev7560et1d0.apps.googleusercontent.com',
    androidClientId:
      '625212493169-ptarfq8gddcsl2q9a6mf0ev7560et1d0.apps.googleusercontent.com',
    iosClientId:
      '625212493169-ptarfq8gddcsl2q9a6mf0ev7560et1d0.apps.googleusercontent.com',
    webClientId:
      '625212493169-ptarfq8gddcsl2q9a6mf0ev7560et1d0.apps.googleusercontent.com',
    redirectUri,
    projectNameForProxy: "@quocquan21/HiPC",
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (res) => {
          const user = res.user;
          const payload = {
            firebaseUid: user.uid,
            full_name: user.displayName,
            email: user.email,
            avatarUrl: user.photoURL,
          };
          try {
            const resp = await axiosInstance.post('/users/google-login', payload);
            if (resp.data?.token) {
              await AsyncStorage.setItem('token', resp.data.token);
              await AsyncStorage.setItem(
                'user',
                JSON.stringify(resp.data.user)
              );
            } else {
              await AsyncStorage.setItem('user', JSON.stringify(resp.data.user));
            }
          } catch (e) {
            console.log('Error saving user to API:', e);
          }
          router.replace('/HomeScreen');
        })
        .catch((err) => console.log(err));
    }
  }, [response]);

  const handleSocialLogin = async (platform) => {
    if (platform === 'Google') {
      await promptAsync();
    }
  };

  return (
    <View style={styles.container}>
      {/* Premium Social Buttons with Labels */}
      <TouchableOpacity 
        style={[styles.socialButton, styles.googleButton]}
        onPress={() => handleSocialLogin('Google')}
        activeOpacity={0.8}
      >
        <Image
          source={socialIcons.Google}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Tiếp tục với Google</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.socialButton, styles.appleButton]}
        onPress={() => handleSocialLogin('Apple')}
        activeOpacity={0.8}
      >
        <Image
          source={socialIcons.Apple}
          style={styles.socialIcon}
        />
        <Text style={[styles.socialButtonText, styles.appleText]}>
          Tiếp tục với Apple
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.socialButton, styles.facebookButton]}
        onPress={() => handleSocialLogin('Facebook')}
        activeOpacity={0.8}
      >
        <Image
          source={socialIcons.Facebook}
          style={styles.socialIcon}
        />
        <Text style={[styles.socialButtonText, styles.facebookText]}>
          Tiếp tục với Facebook
        </Text>
      </TouchableOpacity>

      {/* Alternative: Compact Icon-only Version */}
      <View style={styles.compactContainer}>
        <Text style={styles.compactLabel}>Hoặc chọn nhanh:</Text>
        <View style={styles.compactButtonsRow}>
          {Object.keys(socialIcons).map((platform, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.compactSocialButton}
              onPress={() => handleSocialLogin(platform)}
              activeOpacity={0.8}
            >
              <Image
                source={socialIcons[platform]}
                style={styles.compactSocialIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    resizeMode: 'contain',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  appleText: {
    color: '#fff',
  },
  facebookText: {
    color: '#fff',
  },
  // Compact version styles
  compactContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  compactLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  compactButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  compactSocialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  compactSocialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default SocialButtons;