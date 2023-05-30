import React from "react";
import {
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IosModal from "./IosModal";
import AndroidModal from "./AndroidModal";

type DefaultModalProps = {
    visible: boolean;

    children?: React.ReactNode;

    onRequestClose: (() => void);
}

const DefaultModal: React.FC<DefaultModalProps> = (props) => {
    const defaultChildren = (
        <View style={styles.mainContainer}>
            <TouchableOpacity style={styles.closeButtonContainer} onPress={props.onRequestClose}>
                <Icon name='ios-close' size={24} />
            </TouchableOpacity>
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
        padding: 20,
        flex: 1,
    },
    closeButtonContainer: {
        alignSelf: 'flex-end',
        marginBottom: 15,
    },
});

export default DefaultModal;