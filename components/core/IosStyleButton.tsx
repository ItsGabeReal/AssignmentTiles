import React from "react";
import {
    ColorValue,
    Text,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
} from "react-native";

type IosStyleButtonProps = {
    title: string;
    
    onPress: (() => void);
    
    disabled?: boolean;

    hitSlop?: number;

    containerStyle?: ViewStyle;

    textStyle?: TextStyle;

    color?: ColorValue;
}

const IosStyleButton: React.FC<IosStyleButtonProps> = (props) => {
    return (
        <TouchableOpacity disabled={props.disabled} onPress={props.onPress} hitSlop={props.hitSlop} style={props.containerStyle}>
            <Text
                style={[props.textStyle, { color: props.disabled ? '#8888' : props.color ? props.color : '#07f'}]}
            >
                {props.title}
            </Text>
        </TouchableOpacity>
    );
}

export default IosStyleButton;