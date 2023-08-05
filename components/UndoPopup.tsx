import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
    StyleSheet,
    Text,
} from 'react-native';
import CloseButton from './core/CloseButton';
import { colors, fontSizes } from '../src/GlobalStyles';
import IosStyleButton from './core/IosStyleButton';
import ViewWithBackHandler from './core/ViewWithBackHandler';

export type UndoPopupRef = {
    /**
     * Shows the undo popup with the provided prompt. If the user
     * pressed undo, onUndoPressed will be called.
     */
    open: ((prompt: string, onUndoPressed: (() => void)) => void);
}

type UndoPopupProps = {

}

const UndoPopup = forwardRef<UndoPopupRef, UndoPopupProps>((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [undoPrompt, setUndoPrompt] = useState('');
    
    const undoPressedCallback = useRef<(() => void) | null>(null);

    useImperativeHandle(ref, () => ({
        open(prompt, onUndoPressed) {
            setUndoPrompt(prompt);
            undoPressedCallback.current = onUndoPressed;

            setVisible(true);
        }
    }));

    function close() {
        setVisible(false);
    }

    function onUndoPressed() {
        undoPressedCallback.current?.();
        close();
    }

    if (visible) {
        return (
            <ViewWithBackHandler
                style={styles.mainContainer}
                onRequestClose={close}
            >
                <CloseButton onPress={close} color={colors.dimText} size={18} hitSlop={12} />
                <Text style={styles.promptText}>{undoPrompt}</Text>
                <IosStyleButton title='Undo' onPress={onUndoPressed} textStyle={styles.undoText} containerStyle={styles.undoButtonContainer} hitSlop={10} />
            </ViewWithBackHandler>
        );
    }
    else return null;
});

export default UndoPopup;

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        width: 250,
        bottom: 0,
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
        //fontWeight: 'bold',
        fontSize: fontSizes.h2,
    },
    undoButtonContainer: {
        marginLeft: 'auto',
    },
});