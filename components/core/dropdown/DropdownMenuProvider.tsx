/**
 * Provides the context for clients to use to open a dropdown menu,
 * and displays the dropdown menu when open.
 * 
 * This provider should lie at the root of the app so that all app
 * content is a child of this component.
 * 
 * Use the DropdownMenu component to create a context menu.
 */

import React, { useState, createContext } from 'react';
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import ViewWithBackHandler from '../views/ViewWithBackHandler';



// ============================== CONTEXT SETUP ==============================

export type DropdownMenuGeometry = {
    screenX: number;
    screenY: number;
    width: number;
}

export type DropdownMenuParams = {
    /**
     * The location and size of the dropdown box
     */
    geometry: DropdownMenuGeometry;

    /**
     * The content of the dropdown box
     */
    children: React.ReactNode;

    /**
     * The style of the dropdown box
     */
    style?: StyleProp<ViewStyle>;
}

export type DropdownMenuContextType = {
    /**
     * Open a dropdown menu with the specified parameters
     */
    open: ((params: DropdownMenuParams) => void);

    /**
     * Close the open dropdown menu if open.
     */
    close: (() => void);
}

export const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);



// ============================== PROVIDER COMPONENT ==============================

type DropdownMenuProviderProps = {
    children?: React.ReactNode;
}

const DropdownMenuProvider: React.FC<DropdownMenuProviderProps> = (props) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [geometry, setGeometry] = useState<DropdownMenuGeometry | null>(null);
    const [dropdownChildren, setDropdownChildren] = useState<React.ReactNode | null>(null);
    const [dropdownStyle, setDropdownStyle] = useState<StyleProp<ViewStyle> | null>(null);

    function close() {
        setDropdownOpen(false);
    }

    return (
        <DropdownMenuContext.Provider value={{
            open(params) {
                setDropdownOpen(true);
                setGeometry(params.geometry);
                setDropdownChildren(params.children);
                setDropdownStyle(params.style);
            },
            close() {
                if (dropdownOpen)
                    close();
            }
        }}>
            <View style={StyleSheet.absoluteFill}>
                <View
                    onStartShouldSetResponderCapture={() => {
                        if (dropdownOpen)
                            close();

                        return false;
                    }}
                    style={StyleSheet.absoluteFill}
                >
                    {props.children}
                </View>
                {dropdownOpen ?
                    <ViewWithBackHandler
                        style={[{ left: geometry?.screenX, top: geometry?.screenY, width: geometry?.width }, dropdownStyle]}
                        //onStartShouldSetResponderCapture={() => true}
                    >
                        {dropdownChildren}
                    </ViewWithBackHandler>
                :
                    null
                }
            </View>
            
        </DropdownMenuContext.Provider>
    );
}

export default DropdownMenuProvider;
