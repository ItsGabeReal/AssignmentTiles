import {
    StyleSheet,
    View,
    Button,
} from "react-native";

export default function TestButton({ onPress }) {
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
        alignItems: 'center'
    },
});