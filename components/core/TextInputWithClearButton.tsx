import React, { forwardRef, useRef } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    TextInputProps,
    ColorValue,
    Appearance,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type TextInputWithClearButtonProps = Omit<TextInputProps, 'clearButtonMode'> & {
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
}

const TextInputWithClearButton = forwardRef<TextInput, TextInputWithClearButtonProps>((props, parentRef) => {
    const {
        closeButtonSize = 16,
        closeButtonColor = Appearance.getColorScheme() === 'light' ? 'black' : 'white',
        closeButtonHitSlop = 20,
        ...otherProps
    } = props;

    const textInputRef = useRef<TextInput | null>(null);

    // Grabs the TextInput reference (so this component can clear/focus the TextInput),
    // then passes the reference to forwardRef.
    function saveRef(ref: TextInput | null) {
        textInputRef.current = ref;

        if (typeof parentRef === 'function') parentRef(ref);
        else if (parentRef !== null) parentRef.current = ref;
    }

    function onClearButtonPressed() {
        textInputRef.current?.clear();
        textInputRef.current?.focus();
    }

    return (
        <View style={styles.subcontainer}>
            <TextInput ref={saveRef} {...otherProps} />
            <TouchableOpacity onPress={onClearButtonPressed} hitSlop={closeButtonHitSlop}>
                <Icon name='close' size={closeButtonSize} color={closeButtonColor} />
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    subcontainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    closeButtonContainer: {
        position: 'absolute',
        height: '100%',
        justifyContent: 'center',
    }
});

export default TextInputWithClearButton;