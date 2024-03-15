/**
 * A View component that is centered in the middle of the screen
 * with a press out area behind it to close it. The View also avoids
 * the keyboard.
 */

import React, {
    useState,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    StyleSheet,
    View,
    KeyboardAvoidingView,
    ViewStyle,
    StyleProp,
} from 'react-native';
import ViewWithBackHandler from './ViewWithBackHandler';

export type PressOutViewRef = {
    /**
     * Shows the modal.
     */
    open: (() => void);

    /**
     * Closes the modal.
     */
    close: (() => void);
}

type PressOutViewProps = {
    children?: React.ReactNode;

    style?: StyleProp<ViewStyle>;

    /**
     * Called when the user closes the view, either by pressing
     * in the press out area or pressing the back button ( not called
     * when closed via PressOutViewRef.close() ).
     */
    onClose?: (() => void);

    /**
     * Specifies if touch events on the press out area should be obsorbed.
     * Default value is true.
     */
    pressOutObsorbsTouch?: boolean;
}

const PressOutView = forwardRef<PressOutViewRef, PressOutViewProps>((props, ref) => {
    const {
        pressOutObsorbsTouch = false
    } = props;
    
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        open() {
            setVisible(true);
        },
        close() {
            setVisible(false);
        }
    }));

    function close() {
        props.onClose?.();
        setVisible(false);
    }

    if (visible) {
        return (
            <ViewWithBackHandler
                onRequestClose={close}
                onStartShouldSetResponder={() => {
                    close();
                    return pressOutObsorbsTouch;
                }}
                style={styles.pressOutContainer}
            >
                <KeyboardAvoidingView behavior='padding' style={styles.keyboardAvoidingView}>
                    <View style={props.style}>
                        {props.children}
                    </View>
                </KeyboardAvoidingView>
            </ViewWithBackHandler>
        )
    }
    else
        return null;
});

const styles = StyleSheet.create({
    pressOutContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#0008',
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default PressOutView;