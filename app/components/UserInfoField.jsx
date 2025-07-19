import { View, Text, StyleSheet } from 'react-native';

export default function UserInfoField({ label, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 8,
    padding: 16, marginHorizontal: 20, marginBottom: 12, elevation: 2
  },
  label: { fontSize: 14, fontWeight: '500', color: '#1976ff', marginBottom: 6 },
});