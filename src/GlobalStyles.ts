import {StyleSheet, ColorValue} from 'react-native';

const TEXT_COLOR: ColorValue = 'white';

export const textStyles = StyleSheet.create({
    title: {
        color: TEXT_COLOR,
        fontSize: 24,
        fontWeight: 'bold',
    },
    h1: {
        color: TEXT_COLOR,
        fontSize: 20,
    },
    h2: {
        color: TEXT_COLOR,
        fontSize: 18,
    },
    h3: {
        color: TEXT_COLOR,
        fontSize: 16,
    },
    p: {
        color: TEXT_COLOR,
        fontSize: 14,
    },
});

export const generalStyles = StyleSheet.create({
    fieldDescription: {
        ...textStyles.h3,
        marginLeft: 10,
        marginBottom: 5,
    },
    parameterContainer: {
        padding: 15,
        backgroundColor: '#333',
        borderRadius: 10,
        borderColor: '#666',
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 15,
    },
    numberInput: {
        ...textStyles.p,
        backgroundColor: '#8888',
        padding: 5,
        minWidth: 30,
        textAlign: 'center',
    },
});