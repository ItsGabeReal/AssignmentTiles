import React from "react";
import {
    ColorValue,
    Modal,
    View,
    KeyboardAvoidingView,
} from "react-native";

const IOS_PAGE_SHEET_TOP_MARGIN = 40;

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
                <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={IOS_PAGE_SHEET_TOP_MARGIN} style={{flex: 1}}>
                    <View style={{flex: 1}}>
                        {props.children}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

export default IosModal;