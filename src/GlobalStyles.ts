import {
    StyleSheet,
    ColorValue,
    Appearance
} from 'react-native';
import { RGBAColor, hexToRGBA } from './ColorHelpers';

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

    l0_rgba: RGBAColor;
    l1_rgba: RGBAColor;
    l2_rgba: RGBAColor;
    l3_rgba: RGBAColor;
    l4_rgba: RGBAColor;
    todayL1_rgba: RGBAColor;
    todayL2_rgba: RGBAColor;
    dimText_rgba: RGBAColor;
    text_rgba: RGBAColor;
}

const darkTheme: ColorScheme = {
    l0: '#101010',
    l1: '#202020', todayL1: '#002448',
    l2: '#303030', todayL2: '#0066CD',
    l3: '#404040',
    l4: '#505050',
    dimText: '#A0A0A0',
    text: '#FFFFFF',

    // These should be the same as above
    l0_rgba: hexToRGBA('#101010'),
    l1_rgba: hexToRGBA('#202020'),todayL1_rgba: hexToRGBA('#002448'),
    l2_rgba: hexToRGBA('#303030'),todayL2_rgba: hexToRGBA('#0066CD'),
    l3_rgba: hexToRGBA('#404040'),
    l4_rgba: hexToRGBA('#505050'),
    dimText_rgba: hexToRGBA('#A0A0A0'),
    text_rgba: hexToRGBA('#FFFFFF')
}

const lightTheme: ColorScheme = {
    l0: '#c0c0c0',
    l1: '#d0d0d0', todayL1: '#accae5',
    l2: '#e0e0e0', todayL2: '#A7D4FF',
    l3: '#f0f0f0',
    l4: '#ffffff',
    dimText: '#808080',
    text: '#000000',

    // These should be the same as above
    l0_rgba: hexToRGBA('#c0c0c0'),
    l1_rgba: hexToRGBA('#d0d0d0'),todayL1_rgba: hexToRGBA('#accae5'),
    l2_rgba: hexToRGBA('#e0e0e0'),todayL2_rgba: hexToRGBA('#A7D4FF'),
    l3_rgba: hexToRGBA('#f0f0f0'),
    l4_rgba: hexToRGBA('#ffffff'),
    dimText_rgba: hexToRGBA('#808080'),
    text_rgba: hexToRGBA('#000000')
}

export const colors = colorTheme === 'light' ? lightTheme : darkTheme;

export const categoryColorPalette: RGBAColor[] = [
    hexToRGBA('#DE1212'), // Red
    hexToRGBA('#E26912'), // Orange
    hexToRGBA('#C9C91D'), // Yellow
    hexToRGBA('#2EC610'), // Green
    hexToRGBA('#10C6C6'), // Aqua
    hexToRGBA('#2F60EE'), // Blue
    hexToRGBA('#A22FEE'), // Purple
    hexToRGBA('#E212E2'), // Pink
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
        //fontWeight: 'bold',
        color: '#FFFFFF80',
    },
    parameterContainer: {
        padding: 10,
        backgroundColor: '#20202030',
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
