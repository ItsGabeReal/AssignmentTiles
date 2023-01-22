import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View
} from "react-native";

// Variables outside app are the same across all instances of app
// Variables inside app are unique across each instance of app
// Therefore, I don't think it matters what I do since there is only one instance of app.

export default function App() {


  // Layout
  return (
    <View style={styles.container}>
      <Text>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  }
});
