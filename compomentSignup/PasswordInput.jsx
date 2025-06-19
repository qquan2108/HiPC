import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";

const PasswordInput = ({ value, onChangeText, placeholder, show, toggleShow }) => (
  <View style={styles.inputContainer}>
    <FontAwesome name="lock" size={20} color="#aaa" style={{ marginRight: 10 }} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      secureTextEntry={!show}
      value={value}
      onChangeText={onChangeText}
    />
    <TouchableOpacity onPress={toggleShow}>
      <Feather name={show ? "eye" : "eye-off"} size={20} color="#aaa" />
    </TouchableOpacity>
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

export default PasswordInput;
