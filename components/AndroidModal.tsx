import React, { useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
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

    onRequestClose: (() => void);
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
        <Animated.View style={{ ...styles.screenDimmer, opacity: backgroundOpacity }} pointerEvents="none">
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
                    {props.children}
                </KeyboardAvoidingView>
            </Modal>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    screenDimmer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0004'
    },
    closeOutArea: {
        height: '15%',
    },
    contentContainer: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    }
});

export default AndroidModal;