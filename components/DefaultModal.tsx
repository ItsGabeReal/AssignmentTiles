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
            <TouchableOpacity style={styles.closeButton} onPress={props.onRequestClose}>
                <Icon name='ios-close' size={24} />
            </TouchableOpacity>
            {props.children}
        </View>
    )
    return (
        <>
            {Platform.OS == 'android' ?
                <AndroidModal backgroundColor={'#ddd'} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {defaultChildren}
                </AndroidModal>
                :
                <IosModal backgroundColor={'#ddd'} visible={props.visible} onRequestClose={props.onRequestClose}>
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
    closeButton: {
        backgroundColor: '#0002',
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 50,
        marginBottom: 10,
    },
});

export default DefaultModal;