import { ColorValue } from "react-native";

/**
 * WARNING: This type is a dependency for version 2 of the
 * redux store. Do what you will with that information.
 */
export type RGBAColor = {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * Returns a mix between two colors.
 * 
 * @param {RGBAColor} colorA First color
 * @param {RGBAColor} colorB Second color
 * @param {number} blend The strength of colorB from 1-0. Default is 0.5.
 */
export function mixColor(colorA: RGBAColor, colorB: RGBAColor, blend: number = 0.5): RGBAColor {
    // Easy return cases
    if (blend === 0)
        return colorA;

    if (blend === 1)
        return colorB;

    const rgbaA = colorA;
    const rgbaB = colorB;

    const combinedRGBA: RGBAColor = {
        r: rgbaA.r + Math.round((rgbaB.r - rgbaA.r) * blend),
        g: rgbaA.g + Math.round((rgbaB.g - rgbaA.g) * blend),
        b: rgbaA.b + Math.round((rgbaB.b - rgbaA.b) * blend),
        a: rgbaA.a + Math.round((rgbaB.a - rgbaA.a) * blend)
    }
    
    return combinedRGBA;
}

export function RGBAToColorValue(rgba: RGBAColor): ColorValue {
    if (rgba.r === undefined || rgba.g === undefined || rgba.b === undefined || rgba.a === undefined) {
        console.warn(`ColorHelpers -> RGBAToColorValue: RGBA values are undefined.`);
        return 'pink';
    }

    if (rgba.a === 255)
        return `rgb(${rgba.r || 0}, ${rgba.g || 0}, ${rgba.b || 0})`;
    else
        return `rgba(${rgba.r || 0}, ${rgba.g || 0}, ${rgba.b || 0}, ${(rgba.a || 255)/255})`;
}

/**
 * WARNING: This function is used to convert old category colors
 * to RGBA objects. Major changes may break migration from V1 to V2.
 */
export function hexToRGBA(hexStr: string) {
    const output: RGBAColor = {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    }

    // Ensure this is a hex string
    if (hexStr.charAt(0) !== '#') {
        console.warn('ColorHelpers -> hexToRGBA: hexStr is not a hex string.');
        return output;
    }

    // Convert hex string to rgba values
    for (let i = 1; i < hexStr.length; i++) {
        const char = hexStr.charAt(i);
        if (!char) {
            console.error(`ColorHelpers -> colorToRGBA: Error while processing hex code. Character at position ${i} is undefined.`);
            break;
        }

        const value = hexCharToNumber(char);

        // Handle different hex lengths
        if (hexStr.length === 7 || hexStr.length === 9) {
            switch (i) {
                case 1:
                    output.r += value * 16;
                    break;
                case 2:
                    output.r += value;
                    break;
                case 3:
                    output.g += value * 16;
                    break;
                case 4:
                    output.g += value;
                    break;
                case 5:
                    output.b += value * 16;
                    break;
                case 6:
                    output.b += value;
                    break;
                case 7:
                    output.a += value * 16;
                    break;
                case 8:
                    output.a += value;
                    break;
            }
        }
        else if (hexStr.length === 4 || hexStr.length === 5) {
            switch (i) {
                case 1:
                    output.r += value * 17;
                    break;
                case 2:
                    output.g += value * 17;
                    break;
                case 3:
                    output.b += value * 17;
                    break;
                case 4:
                    output.a += value * 17;
                    break;
            }
        }
        else {
            console.warn('ColorHelpers -> hexToRGBA: Length of hex code unrecognized.');
            break;
        }
    }

    // If no alpha is provided, assume alpha is maxed
    if (hexStr.length === 7 || hexStr.length === 4) {
        output.a = 255;
    }

    return output;
}

function hexCharToNumber(char: string) {
    switch (char.toUpperCase()) {
        case '0':
            return 0;
        case '1':
            return 1;
        case '2':
            return 2;
        case '3':
            return 3;
        case '4':
            return 4;
        case '5':
            return 5;
        case '6':
            return 6;
        case '7':
            return 7;
        case '8':
            return 8;
        case '9':
            return 9;
        case 'A':
            return 10;
        case 'B':
            return 11;
        case 'C':
            return 12;
        case 'D':
            return 13;
        case 'E':
            return 14;
        case 'F':
            return 15;
        default:
            console.error('ColorHelpers -> hexCharToNumber: Could not convert character. Character not recognized:', char);
            return 0;
    }
}

export function colorsEqual(color1: RGBAColor, color2: RGBAColor) {
    return (color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a)
}

export const white: RGBAColor = { r: 255, g: 255, b: 255, a: 255 };
export const black: RGBAColor = { r: 0,   g: 0,   b: 0,   a: 255 };
export const gray: RGBAColor =  { r: 128, g: 128, b: 128, a: 255 };
export const green: RGBAColor = { r: 18,  g: 183, b: 18,  a: 255 };
export const red: RGBAColor =   { r: 180, g: 10,  b: 10,  a: 255 };
