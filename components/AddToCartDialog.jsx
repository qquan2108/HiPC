import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddToCartDialog({
  visible,
  onClose,
  selectedProduct,
  selectedVariant,
  quantity,
  onQuantityChange,
  onVariantSelect,
  onConfirm,
  qtyError,
  formatCurrency,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn phiên bản</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Product Preview */}
          <View style={styles.productPreview}>
            <Image
              source={
                typeof selectedProduct?.image === "string"
                  ? { uri: selectedProduct.image }
                  : selectedProduct?.image
              }
              style={styles.modalProductImage}
              resizeMode="contain"
            />
            <View style={styles.productInfo}>
              <Text style={styles.modalProductName} numberOfLines={2}>
                {selectedProduct?.name}
              </Text>
              <Text style={styles.modalProductPrice}>
                {formatCurrency(selectedVariant?.price || selectedProduct?.price)}
              </Text>
              {selectedVariant && (
                <Text style={styles.stockInfo}>
                  Còn {selectedVariant.stock} sản phẩm
                </Text>
              )}
            </View>
          </View>

          {/* Variants List */}
          <Text style={styles.sectionLabel}>Phiên bản:</Text>
          <ScrollView style={styles.variantList}>
            {selectedProduct?.variants?.map((variant) => (
              <TouchableOpacity
                key={variant._id}
                style={[
                  styles.variantItem,
                  selectedVariant?._id === variant._id && styles.selectedVariant,
                  variant.stock <= 0 && styles.disabledVariant,
                ]}
                onPress={() => onVariantSelect(variant)}
                disabled={variant.stock <= 0}
              >
                <View style={styles.variantInfo}>
                  <Text
                    style={[
                      styles.variantLabel,
                      selectedVariant?._id === variant._id &&
                        styles.selectedVariantText,
                    ]}
                  >
                    {variant.name}
                  </Text>
                  <Text
                    style={[
                      styles.variantStock,
                      selectedVariant?._id === variant._id &&
                        styles.selectedVariantText,
                    ]}
                  >
                    {variant.stock <= 0
                      ? "Hết hàng"
                      : `Còn ${variant.stock} sản phẩm`}
                  </Text>
                </View>
                <View style={styles.variantPrice}>
                  <Text
                    style={[
                      styles.priceText,
                      selectedVariant?._id === variant._id &&
                        styles.selectedVariantText,
                    ]}
                  >
                    {formatCurrency(variant.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quantity Section */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Số lượng:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => onQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? "#ccc" : "#666"}
                />
              </TouchableOpacity>

              <TextInput
                style={[styles.quantityInput, qtyError && styles.inputError]}
                value={String(quantity)}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  onQuantityChange(num);
                }}
                keyboardType="number-pad"
                maxLength={3}
              />

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= (selectedVariant?.stock || 99) &&
                    styles.quantityButtonDisabled,
                ]}
                onPress={() => onQuantityChange(quantity + 1)}
                disabled={quantity >= (selectedVariant?.stock || 99)}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    quantity >= (selectedVariant?.stock || 99) ? "#ccc" : "#666"
                  }
                />
              </TouchableOpacity>
            </View>
            {qtyError && <Text style={styles.errorText}>{qtyError}</Text>}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedVariant || selectedVariant.stock <= 0) &&
                styles.disabledButton,
            ]}
            onPress={onConfirm}
            disabled={!selectedVariant || selectedVariant.stock <= 0}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF5252"]}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>
                {selectedProduct?.mode === "buy" ? "Mua ngay" : "Thêm vào giỏ"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  flashSaleBox: {
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 16,
    elevation: 12,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 215, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  sectionTitle: {
    fontWeight: "900",
    fontSize: 20,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flex: 1,
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00FF88",
    marginRight: 6,
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  timerContainer: {
    alignItems: "center",
  },
  timerLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  flashSaleTimer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  timerText: {
    color: "#FF4757",
    fontWeight: "900",
    fontSize: 18,
    lineHeight: 20,
  },
  timerUnit: {
    color: "#FF4757",
    fontWeight: "600",
    fontSize: 9,
    marginTop: -1,
    letterSpacing: 0.2,
  },
  timerSeparator: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    marginHorizontal: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  flashSaleCard: {
    width: 140,
    height: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 4,
    padding: 8,
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  discountBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 3,
    elevation: 5,
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hotBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 3,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#FF4757",
  },
  hotText: {
    color: "#FF4757",
    fontWeight: "800",
    fontSize: 9,
    marginLeft: 2,
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 6,
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    height: 70,
    justifyContent: "center",
    position: "relative",
  },
  flashSaleImage: {
    width: "100%",
    height: 55,
    borderRadius: 8,
    resizeMode: "contain",
  },
  stockIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 3,
  },
  stockText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#333",
  },
  productInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  productNameSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
    textAlign: "left",
    lineHeight: 16,
    minHeight: 32,
  },
  priceSection: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  productPriceSmall: {
    color: "#FF4757",
    fontWeight: "800",
    fontSize: 14,
  },
  originalPriceContainer: {
    position: "relative",
    alignItems: "center",
  },
  originalPriceSmall: {
    fontSize: 10,
    color: "#95A5A6",
    fontWeight: "500",
  },
  strikethrough: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#95A5A6",
  },
  soldContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 5,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  soldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  soldText: {
    fontSize: 9,
    color: "#74B9FF",
    fontWeight: "600",
  },
  ratingText: {
    fontSize: 9,
    color: "#FFD700",
    fontWeight: "600",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: "hidden",
    pointerEvents: "none",
  },
  shimmerGradient: {
    flex: 1,
    opacity: 0.4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 4,
  },
  viewAllCard: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 107, 107, 0.4)",
    borderStyle: "dashed",
    marginRight: 16,
    overflow: "hidden",
  },
  viewAllGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  viewAllContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  viewAllText: {
    color: "#FF6B6B",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 4,
  },
  viewAllSubtext: {
    color: "#95A5A6",
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  viewAllBadge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  viewAllBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontWeight: "800",
    fontSize: 20,
    color: "#222",
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  productPreview: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  modalProductPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF4757",
  },
  stockInfo: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  variantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  selectedVariant: {
    backgroundColor: "#2979ff",
  },
  selectedVariantText: {
    color: "#fff",
  },
  variantInfo: {
    flex: 1,
  },
  variantLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  variantStock: {
    fontSize: 13,
    color: "#666",
  },
  variantPrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FF4757",
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#eee",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  confirmButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  variantList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  disabledVariant: {
    opacity: 0.5,
    backgroundColor: "#f0f0f0",
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quantityInput: {
    width: 56,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
});


