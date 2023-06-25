import React from "react";
import { Platform } from "react-native";
import IosModal from "./core/IosModal";
import AndroidModal from "./core/AndroidModal";

type DefaultModalProps = {
    visible: boolean;

    children?: React.ReactNode;

    /**
     * Called when the modal wants to close. Should set visible to false.
     */
    onRequestClose?: (() => void);
}

const DefaultModal: React.FC<DefaultModalProps> = (props) => {
    return (
        <>
            {Platform.OS == 'android' ?
                <AndroidModal backgroundColor={'#222'} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {props.children}
                </AndroidModal>
                :
                <IosModal backgroundColor={'#222'} visible={props.visible} onRequestClose={props.onRequestClose}>
                    {props.children}
                </IosModal>
            }
        </>
    );
}

export default DefaultModal;