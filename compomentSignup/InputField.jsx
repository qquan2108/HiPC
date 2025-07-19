import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

const InputField = ({ icon, placeholder, value, onChangeText, keyboardType = "default" }) => (
  <View style={styles.inputContainer}>
    {icon}
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
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
  input: {
    flex: 1,
    fontSize: 17,
    color: "#000",
  },
});

export default InputField;
