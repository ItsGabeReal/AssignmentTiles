import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    ViewStyle,
    View,
    Text,
    Pressable,
    TouchableOpacity,
    FlatList,
    ColorValue,
    Dimensions,
    BackHandler,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors, fontSizes } from '../src/GlobalStyles';
export type ContextMenuOptionDetails = {
    /**
     * The name of the option.
     */
    name: string;

    /*
    * Icon name from the react-native-vector-icons/MaterialIcons library to appear next to the option name.
    */
    iconName?: string;

    /**
     * Color of the name text and icon.
     */
    color?: ColorValue;

    /**
     * Callback for when this function is pressed.
     */
    onPress: (() => void);
}

export type ContextMenuPosition = {
    /**
     * The screen x position.
     */
    x: number;

    /**
     * The screen Y position of the top of the content you don't want to be overlapped.
     */
    topY: number;

    /**
     * The screen Y position of the bottom of the content you don't want to be overlapped.
     */
    bottomY: number;
}

export type ContextMenuDetails = {
    /**
     * A list of options that will appear in the context menu.
     */
    options: ContextMenuOptionDetails[];

    /**
     * Position information for the dropdown.
     */
    position: ContextMenuPosition;
}

type ContextMenuProps = {
    /**
     * The selectable options and position. Should be provided when the context menu is created.
     */
    details: ContextMenuDetails;

    /**
     * Wether the context menu is shown or not.
     */
    visible: boolean;

    /**
     * Callback for when the context menu wants to close. Should set visible state to false.
     */
    onRequestClose: (() => void);
}

type OptionComponentProps = {
    /**
     * Details about this context menu option.
     */
    details: ContextMenuOptionDetails;

    /**
     * Called after the option is pressed, signaling the context menu to close.
     */
    onRequestClose: (() => void);
}

const CONTEXT_MENU_WIDTH = 90;
const APPROXIMATE_CONTEXT_MENU_OPTION_HEIGHT = 40; // paddingTop (10) + iconSize (20) + paddingBottom (10)

const OptionComponent: React.FC<OptionComponentProps> = (props) => {
    function drawIcon() {
        if (props.details.iconName) {
            return (
                <Icon name={props.details.iconName} color={props.details.color} size={20} />
            )
        }
    }

    function handlePress() {
        props.details.onPress();
        props.onRequestClose();
    }

    return (
        <TouchableOpacity onPress={handlePress} style={styles.optionContainer}>
            <Text style={[styles.optionText, { color: props.details.color }]}>{props.details.name}</Text>
            <View style={styles.iconContainer}>
                {drawIcon()}
            </View>
        </TouchableOpacity>
    );
}

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
    useEffect(() => {
        const backAction = () => {
            if (!props.visible) return false; // Differ to the next back handler

            props.onRequestClose?.();
            return true;
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction); // Link back event to props.onClose()

        return () => backHandler.remove(); // Cleanup function
    }, [props.visible]);

    function getPositionStyleProps(): ViewStyle {
        const xPosition = props.details.position.x - CONTEXT_MENU_WIDTH / 2;
        const menuHeight = props.details.options.length * APPROXIMATE_CONTEXT_MENU_OPTION_HEIGHT;
        const windowHeight = Dimensions.get('window').height;

        const shouldShowMenuOnBottom = props.details.position.bottomY + menuHeight < windowHeight;
        if (shouldShowMenuOnBottom) {
            return {
                left: xPosition,
                top: props.details.position.bottomY
            };
        }
        else {
            return {
                left: xPosition,
                top: props.details.position.topY - menuHeight
            };
        }
    }

    if (props.visible) {
        return (
            <Pressable style={StyleSheet.absoluteFill} onPress={props.onRequestClose}>
                <FlatList<ContextMenuOptionDetails>
                    data={props.details.options}
                    renderItem={({ item }) => <OptionComponent details={item} onRequestClose={props.onRequestClose} />}
                    style={[styles.mainContainer, getPositionStyleProps()]}
                />
            </Pressable>
        );
    } else return (<></>);
}

const styles = StyleSheet.create({
    mainContainer: {
        width: CONTEXT_MENU_WIDTH,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
        backgroundColor: colors.l4,
    },
    optionText: {
        fontSize: fontSizes.p,
        fontWeight: 'bold',
    },
    iconContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
});

export default ContextMenu;