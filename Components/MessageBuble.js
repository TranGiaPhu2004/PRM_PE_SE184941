import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MessageBubble({ message }) {
  const isUser = message.sender === "user";
  const isError = message.sender === "error";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : isError ? styles.errorContainer : styles.aiContainer,
      ]}
    >
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
  },
  aiContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
  },
  errorContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#fee2e2",
  },
  text: {
    color: "black",
  },
});
