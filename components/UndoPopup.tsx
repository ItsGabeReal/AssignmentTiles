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
    /**
     * Set this to true if you want to put this popup
     * in a custom continer. Otherwise, it will position
     * itself on the bottom of the screen.
     * 
     * Default: false
     */
    relativePosition?: boolean;
}

const UndoPopup = forwardRef<UndoPopupRef, UndoPopupProps>((props, ref) => {
    const {
        relativePosition = false,
    } = props;

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
            <ViewWithBackHandler style={[styles.mainContainer, relativePosition ? {} : styles.absolutePosition]} onRequestClose={close}>
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
        flexDirection: 'row',
        alignItems: 'center',
        width: 250,
        backgroundColor: colors.l4,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderRadius: 30,
    },
    absolutePosition: {
        position: 'absolute',
        bottom: 0,
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