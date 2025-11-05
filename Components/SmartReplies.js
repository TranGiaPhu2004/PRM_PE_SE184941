import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from "react-native";
import { Chip } from "react-native-paper";

export default function SmartReplies({ suggestions, onSelect }) {
  if (!suggestions?.length) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {suggestions.map((s, idx) => (
          <TouchableOpacity key={idx} activeOpacity={0.7} onPress={() => onSelect(s)}>
            <Chip style={styles.chip} textStyle={styles.text}>
              {s}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
    paddingVertical: 6,
  },
  container: {
    paddingHorizontal: 8,
  },
  chip: {
    marginRight: 6,
    backgroundColor: "#f3f4f6",
  },
  text: {
    fontSize: 14,
    color: "#111827",
  },
});
