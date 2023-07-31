import {
    StyleSheet,
    ColorValue,
    Appearance,
} from 'react-native';

export const fontSizes = {
    title: 22,
    h1: 20,
    h2: 18,
    h3: 16,
    p: 14,
    small: 10,
};

export type ColorScheme = {
    l0: ColorValue;
    l1: ColorValue;
    l2: ColorValue;
    l3: ColorValue;
    l4: ColorValue;
    todayL1: ColorValue;
    todayL2: ColorValue;
    dimText: ColorValue;
    text: ColorValue;
}

const darkTheme: ColorScheme = {
    l0: '#101010',
    l1: '#202020', todayL1: '#002448',
    l2: '#303030', todayL2: '#0066CD',
    l3: '#404040',
    l4: '#505050',
    dimText: '#A0A0A0',
    text: 'white',
}

const lightTheme: ColorScheme = {
    l0: '#c0c0c0',
    l1: '#d0d0d0', todayL1: '#accae5',
    l2: '#e0e0e0', todayL2: '#A7D4FF',
    l3: '#f0f0f0',
    l4: '#ffffff',
    dimText: '#808080',
    text: 'black',
}

export const colors = Appearance.getColorScheme() === 'light' ? lightTheme : darkTheme;

export const categoryColorPalette: ColorValue[] = [
    '#DE1212', // Red
    '#E26912', // Orange
    '#C9C91D', // Yellow
    '#2EC610', // Green
    '#10C6C6', // Aqua
    '#2F60EE', // Blue
    '#A22FEE', // Purple
    '#E212E2', // Pink
];

export const globalStyles = StyleSheet.create({
    fieldDescription: {
        marginRight: 8,
        fontSize: fontSizes.h3,
        fontWeight: 'bold',
        color: colors.dimText,
    },
    parameterContainer: {
        padding: 15,
        backgroundColor: colors.l2,
        borderRadius: 10,
        marginBottom: 25,
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
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});