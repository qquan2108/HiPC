import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function BuyWithList({ data }) {
  return (
    <View style={styles.buyWithBox}>
      
      
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Image source={item.image} style={styles.buyWithImage} />
        )}
        style={{ marginTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buyWithBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  buyWithTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    flex: 1,
  },
  buyWithArrow: {
    marginLeft: 8,
    marginRight: 8,
    backgroundColor: "#eaf3ff",
    borderRadius: 16,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  buyWithImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
  },
});