import React from "react";
import { Text, StyleSheet } from "react-native";

const AuthTitle = ({ children }) => (
  <Text style={styles.title}>{children}</Text>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 36,
    color: "#000",
  },
});

export default AuthTitle;
