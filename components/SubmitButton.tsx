import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    Animated,
    Platform,
} from "react-native";

type SubmitButtonProps = {
    title: string;
    
    onPress: (() => void);
    
    disabled?: boolean;

    fontSize?: number;
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
    const androidGreen = '#6b0';
    const iosBlue = '#07f';
    const platformSpecificColor = Platform.OS == 'android' ? androidGreen : iosBlue;
    return (
        <TouchableOpacity disabled={props.disabled} onPress={props.onPress}>
            <Animated.Text
                style={[styles.submitButtonText, {
                    fontSize: props.fontSize || 18,
                    color: props.disabled ? '#aaa' : platformSpecificColor,
                }]}
            >
                {props.title}
            </Animated.Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    submitButtonText: {
        fontWeight: 'bold',
    },
});

export default SubmitButton;