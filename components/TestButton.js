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
    testButton: {
        backgroundColor: '#d0d0d0',
        padding: 10,
        borderRadius: 5,
        width: 70,
        alignItems: 'center'
    }
});