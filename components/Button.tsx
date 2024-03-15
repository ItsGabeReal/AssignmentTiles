/**
 * Custom button component used throughout the app.
 */

import React from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { globalStyles } from '../src/GlobalStyles';
import { RGBAColor, RGBAToColorValue, gray, hexToRGBA, mixColor, white } from '../src/helpers/ColorHelpers';

type ButtonStyle = Omit<ViewStyle, 'backgroundColor'>;

type ButtonProps = {
    /**
     * Text displayed on the button.
     */
    title?: string;

    /**
     * Font size of the button title.
     */
    titleSize?: number;

    /**
     * Name of the icon used (uses material icons).
     */
    iconName?: string;

    /**
     * Size of the icon.
     */
    iconSize?: number;

    /**
     * The color of both the title and the icon.
     */
    fontColor?: RGBAColor;

    /**
     * Color of the background of the button.
     */
    backgroundColor?: RGBAColor;

    /**
     * The space between the icon and the title.
     */
    iconSpacing?: number;

    /**
     * The style of the button's background.
     */
    style?: StyleProp<ButtonStyle>;

    /**
     * Disables the button from being pressed, and greys the button's
     * background color.
     */
    disabled?: boolean;

    /**
     * Called when the button is pressed.
     */
    onPress?: (() => void);
}

const Button: React.FC<ButtonProps> = (props) => {
    const {
        titleSize = 14,
        iconSize = 20,
        fontColor = white,
        backgroundColor = {r:128,g:128,b:128,a:128},
        iconSpacing = 8,
        disabled = false,
    } = props;

    function getFontColor() {
        let output = fontColor;

        if (disabled)
            output = mixColor(output, gray);

        return RGBAToColorValue(output);
    }

    function getButtonColor() {
        let output = backgroundColor;

        if (disabled)
            output = mixColor(output, hexToRGBA('#444'), 0.9);

        return RGBAToColorValue(output);
    }

    function onPress() {
        if (!props.disabled) props.onPress?.();
    }

    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            style={[styles.defaultContainer, props.style, { backgroundColor: getButtonColor() }]}
        >
            <View style={[globalStyles.flexRow, styles.justifyCenter]}>
                {props.iconName !== undefined ? <Icon name={props.iconName} color={getFontColor()} size={iconSize} style={{ marginRight: props.title === undefined ? 0 : iconSpacing }} /> : null}
                {props.title !== undefined ? <Text style={{ fontSize: titleSize, fontWeight: 'bold', color: getFontColor() }}>{props.title}</Text> : null}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    defaultContainer: {
        padding: 12,
        borderRadius: 1000,
    },
    justifyCenter: {
        justifyContent: 'center',
    }
});

export default Button;