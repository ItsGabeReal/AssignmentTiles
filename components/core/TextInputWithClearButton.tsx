import React, { forwardRef, useRef } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    TextInputProps,
    ColorValue,
    StyleProp,
    ViewStyle,
    TextStyle,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type TextInputWithClearButtonProps = Omit<TextInputProps, 'style' | 'clearButtonMode'> & {
    /**
     * The size of the close button to the right of the view.
     * Default is 16.
     */
    closeButtonSize?: number;

    /**
     * The color of the close button icon.
     */
    closeButtonColor?: ColorValue;

    /**
     * The distance away form the close button to still accept touch events.
     * Default is 20.
     */
    closeButtonHitSlop?: number;

    /**
     * The style of the TextInput component inside the container.
     * Note: Try to apply container styling to the 'containerStyle' prop.
     * Otherwise the clear button might not be positioned correctly.
     */
    textInputStyle?: StyleProp<TextStyle>;

    /**
     * The style of the view containing the text input and clear button.
     */
    containerStyle?: StyleProp<ViewStyle>;
}

const TextInputWithClearButton = forwardRef<TextInput, TextInputWithClearButtonProps>((props, parentRef) => {
    const {
        closeButtonSize = 16,
        closeButtonColor = 'white',
        closeButtonHitSlop = 20,
        textInputStyle,
        containerStyle,
        ...otherProps
    } = props;

    const textInputRef = useRef<TextInput | null>(null);

    function setRef(ref: TextInput | null) {
        textInputRef.current = ref;

        if (typeof parentRef === 'function') parentRef(ref);
        else if (parentRef !== null) parentRef.current = ref;
    }

    function onClearButtonPressed() {
        textInputRef.current?.clear();
        textInputRef.current?.focus();
    }

    return (
        <Pressable style={containerStyle} onPress={() => textInputRef.current?.focus()}>
            <View style={styles.mainContainer}>
                <TextInput ref={setRef} style={[textInputStyle, {flex: 1}]} {...otherProps} />
                <TouchableOpacity onPress={onClearButtonPressed} hitSlop={closeButtonHitSlop}>
                    <Icon name='close' size={closeButtonSize} color={closeButtonColor} />
                </TouchableOpacity>
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButtonContainer: {
        position: 'absolute',
        height: '100%',
        justifyContent: 'center',
    }
});

export default TextInputWithClearButton;