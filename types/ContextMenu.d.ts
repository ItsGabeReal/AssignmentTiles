import {
    ColorValue
} from 'react-native';

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