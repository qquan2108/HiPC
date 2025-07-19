import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AIChatBox({ onClose, onStartChat }) {
  return (
    <View style={styles.aiChatBox}>
      <View style={styles.aiChatHeader}>
        <Text style={{ fontWeight: "bold", color: "#4a90e2", fontSize: 16 }}>
          HiPC AI Chat
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={22} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.aiChatBody}>
        <Text style={{ color: "#333", fontSize: 14 }}>
          Xin chào! Tôi là trợ lý AI, bạn cần hỏi gì?
        </Text>
      </View>
      <TouchableOpacity style={styles.aiChatBtn} onPress={onStartChat}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>BẮT ĐẦU CHAT VỚI AI</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  aiChatBox: {
    position: "absolute",
    bottom: 160,
    right: 24,
    width: 270,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 12,
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    zIndex: 200,
    paddingBottom: 12,
  },
  aiChatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f5f8fb",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  aiChatBody: {
    padding: 16,
    minHeight: 60,
  },
  aiChatBtn: {
    backgroundColor: "#4a90e2",
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 6,
  },
});