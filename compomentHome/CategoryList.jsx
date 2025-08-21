import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CategoryList = ({ categories, router }) => (
  <View style={styles.grid}>
    {categories.map((cat, idx) => (
      <TouchableOpacity
        key={cat.key}
        style={styles.item}
        activeOpacity={0.75}
        onPress={() => {
          if (cat.isMore) {
            router.push("./danhmucall");
          } else {
            router.push({ pathname: "./danhmucall", params: { category: cat.label } });
          }
        }}
      >
        <View style={[
          styles.iconWrap,
          cat.isMore && { backgroundColor: "#eaf3ff" }
        ]}>
          <Image
            source={cat.icon}
            style={{ width: 34, height: 34, resizeMode: "contain" }}
          />
        </View>
        <Text style={styles.label} numberOfLines={2}>{cat.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 6,
    marginBottom: 2,
  },
  item: {
    width: "23%",
    alignItems: "center",
    marginVertical: 10,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#f3f6fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: "#222",
    textAlign: "center",
    marginTop: 2,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});

export default CategoryList;