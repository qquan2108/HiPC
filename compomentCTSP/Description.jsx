import React from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import RenderHTML from 'react-native-render-html';

export default function ProductDescription({ htmlContent }) {
  const { width } = useWindowDimensions();
  const contentWidth = width - 32; // padding 16 hai bên

  // Chuyển đổi <section> thành <div> để RenderHTML hỗ trợ tốt hơn
  const normalizedHtml = (htmlContent || '').replace(/<(\/?)(section)([^>]*)>/gi, '<$1div$3>');

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Mô tả sản phẩm</Text>

      <RenderHTML
        contentWidth={contentWidth}
        source={{ html: normalizedHtml }}
        baseStyle={styles.baseText}
        tagsStyles={styles.tags}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#222',
  },
  baseText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 22,
  },
  tags: {
    h1:    { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#222' },
    h2:    { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#333' },
    p:     { marginBottom: 10, lineHeight: 24, color: '#555' },
    strong:{ fontWeight: '700', color: '#222' },
    a:     { color: '#007AFF', textDecorationLine: 'underline' },
    ul:    { marginVertical: 8, paddingLeft: 20 },
    li:    { marginBottom: 6, color: '#555' },
    img:   { width: '100%', height: undefined, aspectRatio: 1.5, marginVertical: 12, borderRadius: 8 },
  },
});
