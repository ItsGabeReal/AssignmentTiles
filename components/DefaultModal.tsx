import React, {useRef, useEffect} from "react";
import {
    StyleSheet,
    View,
    Modal,
    Pressable,
    ColorValue,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

const IOS_PAGE_SHEET_TOP_MARGIN = 40;

type DefaultModalProps = {
    visible: boolean;

    children?: React.ReactNode;

    backgroundColor?: ColorValue;

    /**
     * Called when the modal wants to close. Should set visible to false.
     */
    onRequestClose?: (() => void);
}

const DefaultModal: React.FC<DefaultModalProps> = (props) => {
    const {
        backgroundColor = '#808080'
    } = props;
    
    return (
        <>
            {Platform.OS === 'android' ?
                <AndroidModal backgroundColor={backgroundColor} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {props.children}
                </AndroidModal>
                :
                <IosModal backgroundColor={backgroundColor} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {props.children}
                </IosModal>
            }
        </>
    );
}

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
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#0008', opacity: backgroundOpacity }]} pointerEvents="none">
            <Modal
                animationType='slide'
                visible={props.visible}
                onRequestClose={props.onRequestClose}
                transparent
                statusBarTranslucent
            >
                <Pressable style={styles.closeOutArea} onPress={props.onRequestClose} />
                <KeyboardAvoidingView
                    behavior="padding"
                    style={{ ...styles.contentContainer, backgroundColor: props.backgroundColor }}
                >
                    <View style={{ flex: 1 }}>
                        {props.children}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Animated.View>
    );
}

type IosModalProps = {
    visible: boolean;

    children?: React.ReactNode;

    backgroundColor?: ColorValue;

    /**
     * Called when the modal wants to close. This should set the visible state to false.
     */
    onRequestClose?: (() => void);
}

const IosModal: React.FC<IosModalProps> = (props) => {
    return (
        <Modal
            animationType='slide'
            visible={props.visible}
            onRequestClose={props.onRequestClose}
            presentationStyle="pageSheet"
        >
            <View style={{ flex: 1, backgroundColor: props.backgroundColor }}>
                <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={IOS_PAGE_SHEET_TOP_MARGIN} style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        {props.children}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
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

export default DefaultModal;