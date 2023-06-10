import React from "react";
import {
    StyleSheet,
    View,
    Platform,
} from "react-native";
import IosModal from "./core/IosModal";
import AndroidModal from "./core/AndroidModal";

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
                <AndroidModal backgroundColor={'#222'} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {defaultChildren}
                </AndroidModal>
                :
                <IosModal backgroundColor={'#222'} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {defaultChildren}
                </IosModal>
            }
        </>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        paddingLeft: 25,
        paddingTop: 25,
        paddingRight: 25,
        flex: 1,
    },
});

export default DefaultModal;