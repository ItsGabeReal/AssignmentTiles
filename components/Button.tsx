/**
 * Custom button component used throughout the app.
 */

import React from 'react';
import {
    StyleProp,
    Text,
    TouchableOpacity,
    ViewStyle
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BlurView from './core/BlurView';
import { globalStyles, activeOpacity, colorTheme } from '../src/GlobalStyles';
import { RGBAColor, RGBAToColorValue, gray, mixColor, white } from '../src/ColorHelpers';

type ButtonProps = {
    /**
     * Text displayed on the button.
     */
    title: string;

    /**
     * Name of the icon used (uses material icons).
     */
    iconName: string;

    /**
     * Font size of the button title.
     */
    titleSize?: number;

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
     * Padding between the edge of the button and the title/icon.
     */
    padding?: number;

    /**
     * The space between the icon and the title.
     */
    iconSpacing?: number;

    /**
     * The style of the button's background.
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Disables the button from being pressed, and greys the button's
     * background color.
     */
    disabled?: boolean;

    /**
     * The border radius of the buttons corners.
     */
    borderRadius?: number;

    /**
     * Called when the button is pressed.
     */
    onPress?: (() => void);
}

const Button: React.FC<ButtonProps> = (props) => {
    const {
        titleSize = 14,
        iconSize = 16,
        fontColor = white,
        backgroundColor = {r:128,g:128,b:128,a:128},
        padding = 10,
        iconSpacing = 10,
        borderRadius = 1000,
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
            output = mixColor(output, gray);

        return RGBAToColorValue(output);
    }

    return (
        <TouchableOpacity activeOpacity={activeOpacity} onPress={props.onPress} style={props.style}>
            <BlurView borderRadius={borderRadius} blurType={colorTheme} style={{ backgroundColor: getButtonColor(), padding: padding, justifyContent: 'center', ...globalStyles.flexRow }}>
                <Icon name={props.iconName} color={getFontColor()} size={iconSize} />
                <Text style={{ marginLeft: iconSpacing, fontSize: titleSize, fontWeight: 'bold', color: getFontColor() }}>{props.title}</Text>
            </BlurView>
        </TouchableOpacity>
    );
}

export default Button;