import React from "react";
import { View, Text, Modal, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function PayCardModal({ visible, cards, selectedCard, setSelectedCard, setShowCardModal }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.cardModal}>
          <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
          <FlatList
            data={cards}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.cardItem,
                  selectedCard === item.id && styles.cardItemActive,
                ]}
                onPress={() => setSelectedCard(item.id)}
                activeOpacity={0.8}
              >
                <Image
                  source={
                    item.brand === "mastercard"
                      ? require("../assets/images/mastercard.png")
                      : require("../assets/images/visa.png")
                  }
                  style={styles.cardLogo}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardNumber}>
                    {"••••  ••••  ••••  "}
                    {item.number}
                  </Text>
                  <Text style={styles.cardName}>{item.name}</Text>
                </View>
                <Text style={styles.cardExpire}>{item.expire}</Text>
                <View style={styles.cardRadio}>
                  {selectedCard === item.id && (
                    <View style={styles.cardRadioDot} />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setShowCardModal(false)}
          >
            <Feather name="x" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.10)",
    justifyContent: "flex-end",
  },
  cardModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    maxHeight: "60%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    borderRadius: 14,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eaf3ff",
  },
  cardItemActive: {
    borderColor: "#2979ff",
    backgroundColor: "#eaf3ff",
  },
  cardLogo: {
    width: 36,
    height: 24,
    marginRight: 10,
    resizeMode: "contain",
  },
  cardNumber: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginBottom: 2,
  },
  cardName: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  cardExpire: {
    fontSize: 13,
    color: "#888",
    marginLeft: 8,
    fontWeight: "bold",
  },
  cardRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#2979ff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "#fff",
  },
  cardRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2979ff",
  },
  closeModalBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
});