import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import {
    StyleSheet,
    ViewStyle,
    View,
    Text,
    Pressable,
    TouchableOpacity,
    FlatList,
    Dimensions,
    BackHandler,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { colors, fontSizes } from '../src/GlobalStyles';
import { ContextMenuDetails, ContextMenuOptionDetails } from '../types/ContextMenu';

export type ContextMenuRef = {
    /**
     * Opens the context menu and passes it the provided details.
     */
    create: ((details: ContextMenuDetails) => void);

    /**
     * Close the context menu.
     */
    close: (() => void);
}

type ContextMenuProps = {
    /**
     * If a scrollview is a child of ContextMenu, then scrolling
     * will dismiss the context menu.
     */
    children?: React.ReactNode;
}

const CONTEXT_MENU_WIDTH = 90;
const APPROX_OPTION_HEIGHT = 40; // paddingTop (10) + iconSize (20) + paddingBottom (10)
const OPTION_SPACING = 5;

const emptyContextMenuDetails: ContextMenuDetails = {
    options: [],
    position: { x: 0, topY: 0, bottomY: 0 },
}

const ContextMenu = forwardRef<ContextMenuRef, ContextMenuProps>((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [details, setDetails] = useState(emptyContextMenuDetails);

    useImperativeHandle(ref, () => ({
        create(details: ContextMenuDetails) {
            setDetails(details);
            setVisible(true);
        },
        close() {
            if (visible) close();
        }
    }));
    
    useEffect(() => {
        // Close context menu when back button is pressed on Android
        const backAction = () => {
            if (!visible) return false; // Differ to the next back handler

            setVisible(false);
            return true;
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction); // Link back event to props.onClose()

        return () => backHandler.remove(); // Cleanup function
    }, [visible]);

    function getPositionStyleProps(): ViewStyle {
        const xPosition = details.position.x - CONTEXT_MENU_WIDTH / 2;
        const numOptions = details.options.length;
        const menuHeight = APPROX_OPTION_HEIGHT * numOptions + OPTION_SPACING * (numOptions + 1);
        const windowHeight = Dimensions.get('window').height;

        const shouldShowMenuOnBottom = details.position.bottomY + menuHeight < windowHeight;
        if (shouldShowMenuOnBottom) {
            return {
                left: xPosition,
                top: details.position.bottomY
            };
        }
        else {
            return {
                left: xPosition,
                top: details.position.topY - menuHeight
            };
        }
    }

    function close() {
        setVisible(false);
    }

    function onGestureStart() {
        // When any gesture comes through, close the context menu and do not become the responder.
        if (visible) close();
        return false;
    }

    return (
        <>
            <Pressable onStartShouldSetResponderCapture={onGestureStart}>
                {props.children}
            </Pressable>
            {visible ?
                <FlatList<ContextMenuOptionDetails>
                    data={details.options}
                    renderItem={({ item }) => <OptionComponent details={item} onRequestClose={close} />}
                    style={[styles.mainContainer, getPositionStyleProps()]}
                />
                : <></>
            }
        </>
        
    );
});

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

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        width: CONTEXT_MENU_WIDTH,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginTop: OPTION_SPACING,
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