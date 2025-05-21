import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axiosInstance from "../utils/AxiosInstance";
import { FontAwesome, Feather } from "@expo/vector-icons";

const SignUpScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !pass || !confirmPass || !phone || !address) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (pass !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu không khớp.");
      return;
    }

    try {
      const res = await axiosInstance.post("/users/register", {
        full_name: fullName,
        email,
        password: pass,
        phone,
        address,
      });

      Alert.alert("Thành công", res.data.message || "Đăng ký thành công");
      router.push("/LoginScreen");
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Đăng ký thất bại",
        err.response?.data?.message || "Có lỗi xảy ra."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Tạo một{"\n"}tài khoản</Text>

          {/* Full Name */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="user"
              size={20}
              color="#aaa"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor="#aaa"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="phone"
              size={20}
              color="#aaa"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="map-marker"
              size={20}
              color="#aaa"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ"
              placeholderTextColor="#aaa"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Email input */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="user"
              size={20}
              color="#aaa"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Tên người dùng hoặc Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Mật khẩu */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="lock"
              size={20}
              color="#aaa"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPass}
              value={pass}
              onChangeText={setPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Feather
                name={showPass ? "eye" : "eye-off"}
                size={20}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {/* Nhập lại mật khẩu */}
          <View style={styles.inputContainer}>
            <FontAwesome
              name="lock"
              size={20}
              color="#aaa"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#aaa"
              secureTextEntry={!showConfirmPass}
              value={confirmPass}
              onChangeText={setConfirmPass}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPass(!showConfirmPass)}
            >
              <Feather
                name={showConfirmPass ? "eye" : "eye-off"}
                size={20}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {/* Gợi ý điều khoản */}
          <Text style={styles.termText}>
            Bằng cách nhấp vào nút Đăng ký, bạn đồng ý với lời đề nghị công khai
          </Text>

          {/* Nút tạo tài khoản */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerText}>Tạo tài khoản</Text>
          </TouchableOpacity>

          {/* Dòng phân cách */}
          <Text style={styles.orText}>- Hoặc tiếp tục với -</Text>

          {/* Icon social login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialIcon}>
              <Image
                source={require("../assets/images/Google.png")}
                style={styles.socialImage}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Image
                source={require("../assets/images/apple.png")}
                style={styles.socialImage}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Image
                source={require("../assets/images/Facebook.png")}
                style={styles.socialImage}
              />
            </TouchableOpacity>
          </View>

          {/* Điều hướng sang đăng nhập */}
          <View style={styles.loginRedirect}>
            <Text style={styles.loginText}>Tôi đã có tài khoản </Text>
            <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
  flexGrow: 1,
  paddingHorizontal: 24,
  paddingTop: 60,
  paddingBottom: 40,
  backgroundColor: "#fff",
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 36,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 18,
    backgroundColor: "#f9f9f9",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: "#000",
  },
  termText: {
    color: "#999",
    fontSize: 13,
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: "#f55858",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  registerText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  orText: {
    textAlign: "center",
    color: "#999",
    fontSize: 15,
    marginBottom: 25,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 35,
  },
  socialIcon: {
    borderWidth: 1.5,
    borderColor: "#f55858",
    borderRadius: 100,
    padding: 14,
    marginHorizontal: 12,
  },
  socialImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  loginRedirect: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#555",
    fontSize: 15,
  },
  loginLink: {
    color: "#f55858",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default SignUpScreen;
