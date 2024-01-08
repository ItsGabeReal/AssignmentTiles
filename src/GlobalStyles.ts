import {
    StyleSheet,
    ColorValue,
    Appearance
} from 'react-native';

export let colorTheme: 'dark' | 'light' = Appearance.getColorScheme() || 'dark';

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
    fieldText: ColorValue;
    fieldBackground: ColorValue;
}

const darkTheme: ColorScheme = {
    l0: '#101010',
    l1: '#202020', todayL1: '#002448',
    l2: '#303030', todayL2: '#0066CD',
    l3: '#404040',
    l4: '#505050',
    dimText: '#A0A0A0',
    text: 'white',
    fieldText: '#FFFFFF80',
    fieldBackground: '#FFFFFF10'
}

const lightTheme: ColorScheme = {
    l0: '#c0c0c0',
    l1: '#d0d0d0', todayL1: '#accae5',
    l2: '#e0e0e0', todayL2: '#A7D4FF',
    l3: '#f0f0f0',
    l4: '#ffffff',
    dimText: '#808080',
    text: 'black',
    fieldText: '#FFFFFF80',
    fieldBackground: '#00000010'
}

export const colors = colorTheme === 'light' ? lightTheme : darkTheme;

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
    fieldHeaderContianer: {
        position: 'absolute',
        height: '100%',
        left: 10,
        top: '-50%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#80808080'
    },
    fieldDescription: {
        fontSize: fontSizes.h3,
        fontWeight: 'bold',
        color: colors.fieldText,
    },
    parameterContainer: {
        padding: 10,
        backgroundColor: colors.fieldBackground,
        borderRadius: 10
    },
    numberInput: {
        fontSize: fontSizes.p,
        backgroundColor: '#FFFFFF20',
        padding: 0,
        //minWidth: 30,
        textAlign: 'center',
        color: colors.text,
        borderRadius: 5,
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

/**
 * The opacity of a TouchableOpacity when pressed.
 * 
 * This should be applied to every TouchableOpaclty
 * component in the app.
 */
export const activeOpacity = 0.5;