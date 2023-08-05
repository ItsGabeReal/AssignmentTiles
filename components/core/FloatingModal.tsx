import React, {
    useState,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Pressable,
    KeyboardAvoidingView,
    ViewStyle,
} from 'react-native';

export type FloatingModalRef = {
    /**
     * Shows the modal.
     */
    open: (() => void);

    /**
     * Closes the modal.
     */
    close: (() => void);
}

type FloatingModalProps = {
    children?: React.ReactNode;

    /**
     * Used for children that you don't want to be confined to
     * the inner modal view.
     */
    outerChildren?: React.ReactNode;

    style?: ViewStyle;
}

const FloatingModal = forwardRef<FloatingModalRef, FloatingModalProps>((props, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        open() {
            setVisible(true);
        },
        close() {
            setVisible(false);
        }
    }));

    return (
        <Modal
            animationType='none'
            visible={visible}
            transparent
            onRequestClose={() => setVisible(false)}
        >
            <Pressable style={styles.pressOutContainer} onPress={() => setVisible(false)}>
                <KeyboardAvoidingView behavior='height' style={styles.centeredView}>
                    <View onStartShouldSetResponder={() => true} style={props.style}>
                        {props.children}
                    </View>
                    {props.outerChildren}
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
});

const styles = StyleSheet.create({
    pressOutContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000a',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FloatingModal;