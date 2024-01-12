/**
 * A pressable component that creates a dropdown menu when pressed.
 * 
 * Note: There must be a DropdownMenuProvider component at the root
 * of the app, as it's the component that actually renders the dropdown
 * menu.
 */

import React, { useState, forwardRef, useImperativeHandle, useRef, useContext } from 'react';
import {
    ColorValue,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DropdownMenuContext } from './DropdownMenuProvider';

export type DropdownMenuRef = {
    open: (() => void);

    close: (() => void);
}

type DropdownMenuProps = {
    /**
     * The components displayed within the dropdown button.
     */
    children?: React.ReactNode;

    /**
     * The components displayed in the dropdown when opened.
     */
    content?: React.ReactNode;

    /**
     * The style of the dropdown button contianer.
     */
    style?: StyleProp<ViewStyle>;

    /**
     * The style of the container holding the content.
     */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /**
     * Size of the down-arrow icon. Default is 20.
     */
    dropIconSize?: number;

    /**
     * Color of the down-arrow icon.
     */
    dropIconColor?: ColorValue;
}

const DropdownMenu = forwardRef<DropdownMenuRef, DropdownMenuProps>((props, ref) => {
    const {
        dropIconSize = 20
    } = props;

    const dropdownContext = useContext(DropdownMenuContext);
    
    const touchableOpacityRef = useRef<TouchableOpacity | null>(null);

    useImperativeHandle(ref, () => ({
        open () {
            open();
        },
        close () {
            dropdownContext?.close();
        }
    }));

    function open() {
        /**
         * Measure and send the dimensions of this component to
         * the dropdown appears on top of this component.
         */
        touchableOpacityRef.current?.measure((x, y, w, h, pX, pY) => {
            dropdownContext?.open({
                geometry: {
                    screenX: pX,
                    screenY: pY,
                    width: w
                },
                children: props.content,
                style: props.contentContainerStyle
            });
        });
    }

    function onPress() {
        touchableOpacityRef.current?.measure((x, y, w, h, pX, pY) => {
            dropdownContext?.open({
                geometry: {
                    screenX: pX,
                    screenY: pY,
                    width: w
                },
                children: props.content,
                style: props.contentContainerStyle
            });
        });
    }

    return (
        <TouchableOpacity ref={touchableOpacityRef} style={[styles.flexRow, props.style]} onPress={onPress}>
            <View style={styles.fillContainer}>
                {props.children}
            </View>
            <Icon name='keyboard-arrow-down' size={dropIconSize} color={props.dropIconColor} />
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    dropdown: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    fillContainer: {
        flex: 1
    }
});

export default DropdownMenu;
