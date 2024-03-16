/**
 * Shows undo popup above all other elements on screen (so long as
 * all screen elements are children of the popup).
 * 
 * For convenience, here is a (hopefully) up to date list of
 * when the popup gets open and closed:
 *  - Opens:
 *      On event deleted
 *      On event deleted during multiselect
 *      On category deleted
 *  - Closes:
 *      When user presses x button on popup
 *      On event input opened or closed
 *      On event dragged
 */

import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
} from 'react-native';
import CloseButton from './core/input/CloseButton';
import { colors, fontSizes } from '../src/GlobalStyles';
import IosStyleButton from './core/input/IosStyleButton';
import { EventRegister } from 'react-native-event-listeners';
import SafeAreaView from './core/wrappers/SafeAreaView';

type UndoPopupOverlayProps = {
    children?: React.ReactNode;
}

const UndoPopupOverlay: React.FC<UndoPopupOverlayProps> = (props) => {
    const [visible, setVisible] = useState(false);
    const [actionDescription, setActionDescription] = useState('');
    
    const undoPressedCallback = useRef<(() => void) | null>(null);
    const contextSaveVisible = useRef<boolean>(visible);

    useEffect(() => {
        EventRegister.addEventListener('showUndoPopup', open);

        EventRegister.addEventListener('hideUndoPopup', close);
    }, []);

    function open({ action, onPressed }: { action: string, onPressed: (() => void)} ) {
        setActionDescription(action);
        undoPressedCallback.current = onPressed;

        setVisible(true);
        contextSaveVisible.current = true;
    }

    function close() {
        if (contextSaveVisible.current) {
            setVisible(false);
            contextSaveVisible.current = false;
        }
    }

    function onUndoPressed() {
        undoPressedCallback.current?.();
        close();
    }

    return (
        <View style={StyleSheet.absoluteFill}>
            {props.children}
            {visible ?
                <SafeAreaView pointerEvents='box-none'>
                    <View style={styles.mainContainer}>
                        <CloseButton onPress={close} color={colors.dimText} size={18} hitSlop={12} />
                        <Text style={styles.promptText}>{actionDescription}</Text>
                        <IosStyleButton title='Undo' onPress={onUndoPressed} textStyle={styles.undoText} containerStyle={styles.undoButtonContainer} hitSlop={10} />
                    </View>
                </SafeAreaView>
            :
                null
            }
        </View>
    );
};

export default UndoPopupOverlay;

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        width: 250,
        backgroundColor: colors.l4,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderRadius: 30,
    },
    promptText: {
        color: colors.text,
        fontSize: fontSizes.h3,
        marginLeft: 5,
        marginRight: 8,
    },
    undoText: {
        fontSize: fontSizes.h2,
    },
    undoButtonContainer: {
        marginLeft: 'auto',
    },
});