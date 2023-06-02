import React, { useRef } from 'react';
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
    Modal,
} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";

export type ContextMenuOptionDetails = {
    name: string;

    /*
    * Icon name from the react-native-vector-icons/Ionicons library.
    */
    iconName?: string;

    color?: ColorValue;

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
    options: ContextMenuOptionDetails[];

    position: ContextMenuPosition;
}

type ContextMenuProps = {
    details: ContextMenuDetails;

    visible: boolean;

    onClose: (() => void);
}

type OptionComponentProps = {
    details: ContextMenuOptionDetails;

    onClose: (() => void);
}

const CONTEXT_MENU_WIDTH = 100;
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
        props.onClose();
    }

    return (
        <TouchableOpacity onPress={handlePress} style={styles.optionContainer}>
            <Text style={{ color: props.details.color }}>{props.details.name}</Text>
            <View style={styles.iconContainer}>
                {drawIcon()}
            </View>
        </TouchableOpacity>
    );
}

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
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

    return (
        <Modal
            animationType='none'
            visible={props.visible}
            transparent
            onRequestClose={props.onClose}
        >
            <Pressable style={styles.pressOutContainer} onPress={props.onClose}>
                <View style={[styles.listBackground, styles.dropShadow, getPositionStyleProps()]}>
                    <FlatList<ContextMenuOptionDetails>
                        data={props.details.options}
                        renderItem={({ item }) => <OptionComponent details={item} onClose={props.onClose} />}
                        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                    />
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    pressOutContainer: {
        width: '100%',
        height: '100%',
    },
    listBackground: {
        backgroundColor: '#f4f4f4',
        width: CONTEXT_MENU_WIDTH,
        borderRadius: 10,
    },
    dropShadow: {
        shadowRadius: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    iconContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    itemSeparator: {
        borderColor: '#888',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});

export default ContextMenu;