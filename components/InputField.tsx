import React from 'react';
import {
    View,
    Pressable,
    StyleSheet,
    Text,
    DimensionValue,
    StyleProp,
    ViewStyle
} from 'react-native';
import { colors, fontSizes } from '../src/GlobalStyles';

type InputFieldProps = {
    title?: string;

    headerChildren?: React.ReactNode;

    children?: React.ReactNode;

    onPress?: (() => void);

    /**
     * Style of entire container.
     */
    style?: StyleProp<ViewStyle>;
};

const InputField: React.FC<InputFieldProps> = (props) => {
    return (
        <View style={props.style}>
            <Pressable style={styles.parameterContainer} onPress={props.onPress}>
                {props.children}
            </Pressable>
            <View pointerEvents='box-none' style={styles.fieldHeaderContianer}>
                <View pointerEvents='none'>
                    <Text style={styles.fieldTitle}>{props.title}</Text>
                </View>
                {props.headerChildren}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    fieldHeaderContianer: {
        position: 'absolute',
        height: '100%',
        left: 10,
        top: '-50%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    fieldTitle: {
        fontSize: fontSizes.h3,
        fontWeight: 'bold',
        color: '#FFFFFF80',
        marginRight: 10
    },
    parameterContainer: {
        padding: 10,
        backgroundColor: '#20202020',
        borderRadius: 10
    },
});

export default InputField;