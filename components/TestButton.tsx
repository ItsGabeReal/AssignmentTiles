import React from "react";
import {
    StyleSheet,
    View,
    Button,
    GestureResponderEvent,
} from "react-native";

interface Props {
    onPress: (gesture: GestureResponderEvent) => void;
}

const TestButton: React.FC<Props> = ({ onPress }) => {
    function handlePress(gesture: GestureResponderEvent) {
        console.log('----- TEST BUTTON PRESSED -----');
        onPress(gesture);
    }
    
    return (
        <View pointerEvents="box-none" style={styles.testButtonContainer}>
            <Button
                onPress={handlePress}
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