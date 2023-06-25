import React, { useEffect, useRef } from "react";
import {
    StyleSheet,
    View,
    Modal,
    Pressable,
    ColorValue,
    Animated,
    KeyboardAvoidingView,
} from "react-native";

type AndroidModalProps = {
    visible: boolean;

    children?: React.ReactNode;

    backgroundColor?: ColorValue;

    /**
     * Called when the modal wants to close. This should set the visible state to false.
     */
    onRequestClose?: (() => void);
}

const AndroidModal: React.FC<AndroidModalProps> = (props) => {
    const backgroundOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (props.visible) fadeBackgroundIn();
        else fadeBackgroundOut();
    }, [props.visible]);

    function fadeBackgroundIn() {
        Animated.timing(backgroundOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    function fadeBackgroundOut() {
        Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }

    return (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#0004', opacity: backgroundOpacity }]} pointerEvents="none">
            <Modal
                animationType='slide'
                visible={props.visible}
                onRequestClose={props.onRequestClose}
                transparent={true}
                statusBarTranslucent={true}
            >
                <Pressable style={styles.closeOutArea} onPress={props.onRequestClose} />
                <KeyboardAvoidingView
                    behavior="padding"
                    style={{ ...styles.contentContainer, backgroundColor: props.backgroundColor }}
                >
                    <View style={{flex: 1}}>
                        {props.children}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    closeOutArea: {
        height: '15%',
    },
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    }
});

export default AndroidModal;