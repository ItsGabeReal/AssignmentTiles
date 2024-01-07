import React, {useEffect} from 'react';
import {
    View,
    ViewProps,
    BackHandler,
} from 'react-native';

type ViewWithBackHandlerProps = ViewProps & {
    onRequestClose?: (() => void);
}

const ViewWithBackHandler: React.FC<ViewWithBackHandlerProps> = (props) => {
    const {
        onRequestClose,
        children,
        ...viewProps
    } = props;

    useEffect(() => {
        const backAction = () => {
            onRequestClose?.();
            return true;
        }

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Cleanup function
    }, [onRequestClose]);

    return (
        <View {...viewProps}>
            {children}
        </View>
    );
}

export default ViewWithBackHandler;