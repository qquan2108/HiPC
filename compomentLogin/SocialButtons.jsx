// components/Auth/SocialButtons.jsx
import React, { useEffect } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";

import { LoginManager, AccessToken, Profile } from "react-native-fbsdk-next";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../utils/firebase";
import Toast from "react-native-toast-message";
import axiosInstance from "../utils/AxiosInstance";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const socialIcons = {
  Google: require("../assets/images/Google.png"),
  Apple: require("../assets/images/apple.png"),
  Facebook: require("../assets/images/Facebook.png"),
};

const SocialButtons = () => {
  const router = useRouter();

  // const redirectUri = AuthSession.makeRedirectUri({
  //   useProxy: true,
  //   scheme: 'hipc',
  // });

  // console.log(redirectUri)

  // const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
  //   {
  //     expoClientId:
  //       '625212493169-k32b92lij17jprfvhhs89oii53b5p9dl.apps.googleusercontent.com',
  //     androidClientId:
  //       '625212493169-k32b92lij17jprfvhhs89oii53b5p9dl.apps.googleusercontent.com',
  //     iosClientId:
  //       '625212493169-ptarfq8gddcsl2q9a6mf0ev7560et1d0.apps.googleusercontent.com',
  //     webClientId:
  //       '625212493169-n08r2t6k0fnnkpm5bk1gm3e1tvk37hi6.apps.googleusercontent.com',
  //     selectAccount: true,
  //     redirectUri,
  //     scopes: ['openid', 'profile', 'email'],
  //     responseType: AuthSession.ResponseType.Code,
  //     codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
  //   },
  //   discovery
  // );

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { id_token } = response.params;
  //     const credential = GoogleAuthProvider.credential(id_token);
  //     signInWithCredential(auth, credential)
  //       .then(async (res) => {
  //         const user = res.user;
  //         const payload = {
  //           firebaseUid: user.uid,
  //           full_name: user.displayName,
  //           email: user.email,
  //           avatarUrl: user.photoURL,
  //         };
  //         try {
  //           const resp = await axiosInstance.post('/users/google-login', payload);
  //           if (resp.data?.token) {
  //             await AsyncStorage.setItem('token', resp.data.token);
  //             await AsyncStorage.setItem(
  //               'user',
  //               JSON.stringify(resp.data.user)
  //             );
  //           } else {
  //             await AsyncStorage.setItem('user', JSON.stringify(resp.data.user));
  //           }
  //         } catch (e) {
  //           console.log('Error saving user to API:', e);
  //           Toast.show({
  //             type: 'error',
  //             text1: 'Lỗi đăng nhập',
  //             text2: 'Không thể lưu thông tin người dùng',
  //             position: 'top',
  //           });
  //         }
  //         router.replace('/HomeScreen');
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         Toast.show({
  //           type: 'error',
  //           text1: 'Đăng nhập Google thất bại',
  //           text2: err.message || 'Vui lòng thử lại',
  //           position: 'top',
  //         });
  //       });
  //   } else if (response?.type === 'error') {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Đăng nhập Google thất bại',
  //       position: 'top',
  //     });
  //   }
  // }, [response]);

  useEffect(() => {
    GoogleSignin.configure({
      // client ID for backend token exchange
      webClientId:
        "625212493169-n08r2t6k0fnnkpm5bk1gm3e1tvk37hi6.apps.googleusercontent.com",
      scopes: ["openid", "profile", "email"], // default scopes
      offlineAccess: true, // request serverAuthCode for offline access
      forceCodeForRefreshToken: true, // ensure refresh token is returned
    });
  }, []);

  const handleGoogleLogin = async () => {
    console.log("[DEBUG] Starting Google login flow");

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log("[DEBUG] Play Services available");

      const userInfo = await GoogleSignin.signIn();
      console.log("[DEBUG] GoogleSignin userInfo:", userInfo);
      console.log(
        "GoogleSignin.getCurrentUser():",
        await GoogleSignin.getCurrentUser()
      );

      const { idToken } = await GoogleSignin.getTokens();
      console.log("[DEBUG] Received idToken:", idToken);

      const credential = GoogleAuthProvider.credential(idToken);
      const res = await signInWithCredential(auth, credential);
      console.log("[DEBUG] Firebase signIn result:", res);

      const user = res.user;
      const payload = {
        firebaseUid: user.uid,
        full_name: user.displayName,
        email: user.email,
        avatarUrl: user.photoURL,
      };
      console.log("[DEBUG] Payload to API:", payload);

      try {
        const resp = await axiosInstance.post("/users/google-login", payload);
        console.log("[DEBUG] API response status:", resp.status);
        console.log("[DEBUG] API response data:", resp.data);

        if (resp.data?.token) {
          await AsyncStorage.setItem("token", resp.data.token);
          console.log("[DEBUG] Token saved to AsyncStorage");
        } else {
          console.warn("[WARN] No token returned from API");
        }
        if (resp.data?.user) {
          await AsyncStorage.setItem("user", JSON.stringify(resp.data.user));
          console.log("[DEBUG] User data saved to AsyncStorage");
        }
      } catch (apiError) {
        console.error("[ERROR] API save error:", apiError);
        Toast.show({
          type: "error",
          text1: "Lỗi lưu thông tin",
          text2: apiError.message,
          position: "top",
        });
      }

      console.log("[DEBUG] Navigating to HomeScreen");
      router.replace("/HomeScreen");
    } catch (error) {
      console.error("[ERROR] GoogleSignIn error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("[INFO] User cancelled Google sign-in");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("[INFO] Google sign-in already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({
          type: "error",
          text1: "Play Services không khả dụng",
          position: "top",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Đăng nhập thất bại",
          text2: error.message || "",
          position: "top",
        });
      }
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // Đăng nhập Facebook (gọi native dialog)
      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);
      if (result.isCancelled) {
        Toast.show({
          type: "info",
          text1: "Bạn đã hủy đăng nhập Facebook",
          position: "top",
        });
        return;
      }

      // Lấy access token
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        Toast.show({
          type: "error",
          text1: "Không lấy được token Facebook",
          position: "top",
        });
        return;
      }

      // Lấy profile từ Graph API
      const fbResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${data.accessToken}`
      );
      const user = await fbResponse.json();

      // Chuẩn bị payload gửi backend
      const payload = {
        facebookUid: user.id,
        full_name: user.name,
        email: user.email,
        avatarUrl: user.picture?.data?.url,
      };

      // Gọi API backend
      const resp = await axiosInstance.post("/users/facebook-login", payload);
      if (resp.data?.token)
        await AsyncStorage.setItem("token", resp.data.token);
      if (resp.data?.user)
        await AsyncStorage.setItem("user", JSON.stringify(resp.data.user));

      Toast.show({
        type: "success",
        text1: "Đăng nhập Facebook thành công",
        position: "top",
      });
      router.replace("/HomeScreen");
    } catch (error) {
      console.error("[ERROR] FacebookSignIn error:", error);
      Toast.show({
        type: "error",
        text1: "Đăng nhập Facebook thất bại",
        text2: error.message || "",
        position: "top",
      });
    }
  };

  const handleSocialLogin = async (platform) => {
    if (platform === "Google") {
      await handleGoogleLogin();
    }
    if (platform === 'Facebook') {
    await handleFacebookLogin();
  }
  };

  return (
    <View style={styles.container}>
      {/* Premium Social Buttons with Labels */}
      
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
    width: "100%",
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    resizeMode: "contain",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  appleText: {
    color: "#fff",
  },
  facebookText: {
    color: "#fff",
  },
  // Compact version styles
  compactContainer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  compactLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    fontWeight: "500",
  },
  compactButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  compactSocialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  compactSocialIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default SocialButtons;
