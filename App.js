import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ScrollView,
} from "react-native";

export default function App() {
  // If you're using a variable to update the layout dynamically, use a state.

  // States
  const [person, setPerson] = useState({
    name: "Gabe",
    age: 20,
    height: "Taller than you",
  });
  const [buttonDisabled, setButtonDisabled] = useState(true);

  // Vars
  const [confirmationText, setConfirmationText] = useState("");

  // Functions
  const getConfirmationText = () => {
    return `Yes. I want to kill ${person.name}.`;
  };
  const [placeholder, setPlaceholder] = useState(getConfirmationText); // Must be defined after getConfirmationText

  const onKill = () => {
    setPerson({ name: "Dead Gabe", age: 0, height: "6 feet under" });
    updateKillButton(confirmationText);
    setPlaceholder(getConfirmationText);
  };

  const onConfirmationTextChanged = (newText) => {
    setConfirmationText(newText);
    updateKillButton(newText);
  };

  const updateKillButton = (newText) => {
    if (newText == getConfirmationText()) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  };

  // Layout
  return (
    <View style={styles.container}>
      <View>
        <Text>Here are some of {person.name}'s personal details, uwu:</Text>
      </View>
      <View>
        <Text>Age: {person.age}</Text>
      </View>
      <View>
        <Text>Height: {person.height}</Text>
      </View>
      <View>
        <Text>
          This concludes the segment about {person.name}'s personal details.
        </Text>
      </View>
      <View>
        <Text>
          Would you like to kill {person.name}? If so, type "Yes. I want to kill{" "}
          {person.name}."
        </Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          onChangeText={onConfirmationTextChanged}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Kill Gabe" disabled={buttonDisabled} onPress={onKill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#777",
    padding: 8,
    margin: 10,
    width: 200,
    borderRadius: 3,
  },
});
