import React from "react";
import {
    StyleSheet,
    View,
    Platform,
} from "react-native";
import IosModal from "./IosModal";
import AndroidModal from "./AndroidModal";

type DefaultModalProps = {
    visible: boolean;

    children?: React.ReactNode;

    onRequestClose?: (() => void);
}

const DefaultModal: React.FC<DefaultModalProps> = (props) => {
    const defaultChildren = (
        <View style={styles.mainContainer}>
            {props.children}
        </View>
    )
    return (
        <>
            {Platform.OS == 'android' ?
                <AndroidModal backgroundColor={'#fff'} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {defaultChildren}
                </AndroidModal>
                :
                <IosModal backgroundColor={'#fff'} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {defaultChildren}
                </IosModal>
            }
        </>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        padding: 25,
        flex: 1,
    },
});

export default DefaultModal;