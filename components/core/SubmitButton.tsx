import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type SubmitButtonProps = {
    title: string;
    
    onPress: (() => void);
    
    disabled?: boolean;

    fontSize?: number;
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
    return (
        <TouchableOpacity disabled={props.disabled} onPress={props.onPress}>
            <Text
                style={[styles.submitButtonText, {
                    fontSize: props.fontSize || 18,
                    color: props.disabled ? '#8888' : '#07f',
                }]}
            >
                {props.title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    submitButtonText: {
        fontWeight: 'bold',
    },
});

export default SubmitButton;