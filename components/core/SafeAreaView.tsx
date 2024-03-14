/**
 * An area fiew that can safely display content on both Android and iOS.
 * 
 * For iOS, this is just a wrapper for the SafeAreaView component.
 * For Android, this is a view that sits between the status bar and navigation bar.
 */

import React from 'react';
import {
    Platform,
    View,
    SafeAreaView as IOSSafeAreaView,
    StatusBar,
    StyleSheet,
    Dimensions,
    ViewProps
} from 'react-native';

const SafeAreaView: React.FC<ViewProps> = (props) => {
        const { style, children, ...otherProps } = props;
        
    if (Platform.OS === 'ios') {
        return (
            <IOSSafeAreaView style={[styles.iosSafeView, style]} {...otherProps}>
                {children}
            </IOSSafeAreaView>
        );
    }
    
    if (Platform.OS === 'android') {
        return (
            <View style={[styles.androidSafeView, style]} {...otherProps}>
                {children}
            </View>
        );
    }

    // Default return case (neither iOS or Android)
    return children;
}

const statusBarHeight = StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
    iosSafeView: {
        flex: 1
    },
    androidSafeView: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: statusBarHeight,
        bottom: Dimensions.get('screen').height - Dimensions.get('window').height - statusBarHeight
    }
});

export default SafeAreaView;
