import {StyleSheet, ColorValue} from 'react-native';

export const fontSizes = {
    title: 22,
    h1: 20,
    h2: 18,
    h3: 16,
    p: 14,
    small: 10,
};

export const colors = {
    l0: '#101010',
    l1: '#202020', todayL1: '#002448',
    l2: '#303030', todayL2: '#0066CD',
    l3: '#404040',
    l4: '#505050',
    dimText: '#A0A0A0',
    text: 'white',
}

export const categoryColorPalette: ColorValue[] = [
    '#F00000',
    '#FF6A00',
    '#E7D400',
    '#25DE00',
    '#00E9E9',
    '#225AFF',
    '#9600FF',
    '#EF00E4',
];

export const globalStyles = StyleSheet.create({
    fieldDescription: {
        marginLeft: 10,
        marginBottom: 5,
        fontSize: fontSizes.h3,
        color: colors.dimText,
    },
    parameterContainer: {
        padding: 15,
        backgroundColor: colors.l2,
        borderRadius: 10,
        marginBottom: 15,
    },
    numberInput: {
        fontSize: fontSizes.p,
        backgroundColor: '#8888',
        padding: 5,
        minWidth: 30,
        textAlign: 'center',
        color: colors.text,
    },
    dropShadow: {
        shadowRadius: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
    },
});