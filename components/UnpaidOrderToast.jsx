import Toast, { BaseToast } from "react-native-toast-message";

const UnpaidOrderToast = ({ text1, text2, onContinue }) => (
  <View style={{
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 40,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "row",
    alignItems: "center",
  }}>
    <Ionicons name="alert-circle" size={32} color="#f55858" style={{ marginRight: 12 }} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "bold", fontSize: 16, color: "#f55858" }}>{text1}</Text>
      <Text style={{ fontSize: 14, color: "#333", marginTop: 2 }}>{text2}</Text>
    </View>
    <TouchableOpacity
      style={{
        backgroundColor: "#2979ff",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginLeft: 12,
      }}
      onPress={onContinue}
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>Tiếp tục</Text>
    </TouchableOpacity>
  </View>
);