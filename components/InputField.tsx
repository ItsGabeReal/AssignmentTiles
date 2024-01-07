import React from 'react';
import {
    View,
    Pressable,
    StyleSheet,
    Text
} from 'react-native';
import { colors, fontSizes } from '../src/GlobalStyles';

type InputFieldProps = {
    title?: string;

    headerChildren?: React.ReactNode;

    children?: React.ReactNode;

    onPress?: (() => void);

    width?: number;

    marginBottom?: number;
};

const InputField: React.FC<InputFieldProps> = (props) => {
    return (
        <View style={{ marginBottom: props.marginBottom }}>
            <Pressable style={[styles.parameterContainer, {width: props.width}]} onPress={props.onPress}>
                {props.children}
            </Pressable>
            <View style={styles.fieldHeaderContianer}>
                <Text style={styles.fieldTitle}>{props.title}</Text>
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
        color: colors.fieldText,
        marginRight: 10
    },
    parameterContainer: {
        padding: 10,
        backgroundColor: colors.fieldBackground,
        borderRadius: 10
    },
});

export default InputField;