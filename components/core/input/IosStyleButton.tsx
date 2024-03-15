import React from "react";
import {
    ColorValue,
    Text,
    TouchableOpacity,
    ViewStyle,
    TextStyle,
    StyleProp,
} from "react-native";

type IosStyleButtonProps = {
    /**
     * Title displayed on the button.
     */
    title: string;
    
    onPress: (() => void);
    
    /**
     * When true, the text will be greyed out and won't be able to
     * be pressed.
     */
    disabled?: boolean;

    /**
     * Defines how far your touch can start away from the button.
     */
    hitSlop?: number;

    /**
     * Style for the TouchableOpacity containing the button.
     */
    containerStyle?: StyleProp<ViewStyle>;

    /**
     * Style for the button title.
     */
    textStyle?: StyleProp<TextStyle>;

    /**
     * Color of the button title.
     */
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