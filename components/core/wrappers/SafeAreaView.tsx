/**
 * An area fiew that can safely display content on both Android and iOS.
 */

import React from 'react';
import {
    View,
    StyleSheet,
    ViewProps
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaView: React.FC<ViewProps> = (props) => {
    const { style, children, ...otherProps } = props;

    const insets = useSafeAreaInsets();
    
    return (
        <View style={[StyleSheet.absoluteFill, {...insets}, style]} {...otherProps}>
            {children}
        </View>
    )
}

export default SafeAreaView;
