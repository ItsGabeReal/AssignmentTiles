import React from "react";
import {
    StyleSheet,
    View,
    Button,
    GestureResponderEvent,
} from "react-native";

interface Props {
    onPress: (event: GestureResponderEvent) => void;
}

const TestButton: React.FC<Props> = ({ onPress }) => {
    return (
        <View style={styles.testButtonContainer}>
            <Button
                onPress={onPress}
                title="Test"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    testButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});

export default TestButton;