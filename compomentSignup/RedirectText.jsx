import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const RedirectText = ({ label, linkLabel, onPress }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{label}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.link}>{linkLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
  },
  text: {
    color: "#555",
    fontSize: 15,
  },
  link: {
    color: "#4a90e2",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default RedirectText;
