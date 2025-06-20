import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

const socialIcons = {
  Google: require("../assets/images/Google.png"),
  apple: require("../assets/images/apple.png"),
  Facebook: require("../assets/images/Facebook.png"),
};

const SocialLogin = () => (
  <View style={styles.container}>
    {Object.keys(socialIcons).map((platform) => (
      <TouchableOpacity key={platform} style={styles.icon}>
        <Image
          source={socialIcons[platform]}
          style={styles.image}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 35,
  },
  icon: {
    borderWidth: 1.5,
    borderColor: "#4a90e2",
    borderRadius: 100,
    padding: 14,
    marginHorizontal: 12,
  },
  image: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});

export default SocialLogin;