import { ColorValue } from "react-native";
import { clamp } from "./GlobalHelpers";

type RGBA = {
    red: number,
    green: number,
    blue: number,
    alpha: number
}

/**
 * Darkens the color values of each color (r, g, and b).
 * 
 * @param {ColorValue} color Color input
 * @param {number} amount Amount from 1-0 to darken color by. 0 keeps the color the same, 1 makes it black.
 * @return {string} Hex value of modified color
 * 
 * @example
 * // Darken color by 25%
 * darkenColor(color, 0.25);
 */
export function darkenColor(color: ColorValue, amount: number): ColorValue {
    const rgba = colorToRGBA(color);

    rgba.red = clamp(Math.round(rgba.red * (1 - amount)), 0, 255);
    rgba.green = clamp(Math.round(rgba.green * (1 - amount)), 0, 255);
    rgba.blue = clamp(Math.round(rgba.blue * (1 - amount)), 0, 255);
    
    return RGBAToHex(rgba);
}

/**
 * Darkens the color values of each color (r, g, and b).
 * 
 * @param {ColorValue} color Color input
 * @param {number} amount Amount from 1-0 to lighten color by. 0 keeps the color the same, 1 makes it white.
 * @return {string} Hex value of modified color
 * 
 * @example
 * // Lighten color by 25%
 * lightenColor(color, 0.25);
 */
export function lightenColor(color: ColorValue, amount: number): ColorValue {
    const rgba = colorToRGBA(color);

    rgba.red = clamp(Math.round(rgba.red + (255 - rgba.red) * amount), 0, 255);
    rgba.green = clamp(Math.round(rgba.green + (255 - rgba.green) * amount), 0, 255);
    rgba.blue = clamp(Math.round(rgba.blue + (255 - rgba.blue) * amount), 0, 255);
    
    return RGBAToHex(rgba);
}

/**
 * Returns a mix between two colors.
 * 
 * @param {ColorValue} colorA First color
 * @param {ColorValue} colorB Second color
 * @param {number} blend The strength of colorB from 1-0. Default is 0.5.
 */
export function mixColor(colorA: ColorValue, colorB: ColorValue, blend: number = 0.5): ColorValue {
    // Easy return cases
    if (blend === 0)
        return colorA;

    if (blend === 1)
        return colorB;

    
    const rgbaA = colorToRGBA(colorA);
    const rgbaB = colorToRGBA(colorB);

    const combinedRGBA: RGBA = {
        red: rgbaA.red + Math.round((rgbaB.red - rgbaA.red) * blend),
        green: rgbaA.green + Math.round((rgbaB.green - rgbaA.green) * blend),
        blue: rgbaA.blue + Math.round((rgbaB.blue - rgbaA.blue) * blend),
        alpha: rgbaA.alpha + Math.round((rgbaB.alpha - rgbaA.alpha) * blend)
    }
    
    return RGBAToHex(combinedRGBA);
}

function colorToRGBA(color: ColorValue) {
    const colorStr = color.toString();

    const output: RGBA = {
        red: 0,
        green: 0,
        blue: 0,
        alpha: 0
    }

    for (let i = 1; i < colorStr.length; i++) {
        const char = colorStr.at(i);
        if (!char) {
            console.error(`GlobalHelpers -> colorToRGBA: Error while processing hex code. Character at position ${i} is undefined.`);
            break;
        }

        const value = hexCharToNumber(char);

        switch (i) {
            case 1:
                output.red += value * 16;
                break;
            case 2:
                output.red += value;
                break;
            case 3:
                output.green += value * 16;
                break;
            case 4:
                output.green += value;
                break;
            case 5:
                output.blue += value * 16;
                break;
            case 6:
                output.blue += value;
                break;
            case 7:
                output.alpha += value * 16;
                break;
            case 8:
                output.alpha += value;
                break;
        }
    }

    // If no alpha is provided, assume alpha is maxed
    if (colorStr.length === 7) {
        output.alpha = 255;
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
            console.error('GlobalHelpers -> hexChatToNumber: Could not convert character. Character not recognized.');
            return 0;
    }
}

function RGBAToHex(rgba: RGBA) {
    let output = '#';
    let sixteensPlace;
    let onesPlace;
    
    // Red
    sixteensPlace = Math.floor(rgba.red / 16);
    onesPlace = rgba.red - 16*sixteensPlace;
    output = output + numberToHexChar(sixteensPlace) + numberToHexChar(onesPlace);
    
    // Green
    sixteensPlace = Math.floor(rgba.green / 16);
    onesPlace = rgba.green - 16*sixteensPlace;
    output = output + numberToHexChar(sixteensPlace) + numberToHexChar(onesPlace);
    
    // Blue
    sixteensPlace = Math.floor(rgba.blue / 16);
    onesPlace = rgba.blue - 16*sixteensPlace;
    output = output + numberToHexChar(sixteensPlace) + numberToHexChar(onesPlace);
    
    // Alpha (ignore if maxed)
    if (rgba.alpha !== 255) {
        sixteensPlace = Math.floor(rgba.alpha / 16);
        onesPlace = rgba.alpha - 16*sixteensPlace;
        output = output + numberToHexChar(sixteensPlace) + numberToHexChar(onesPlace);
    }

    return output;
}

function numberToHexChar(number: number) {
    if (number >= 0 && number < 10) {
        return number.toString();
    }
    else {
        switch (number) {
            case 10:
                return 'A';
            case 11:
                return 'B';
            case 12:
                return 'C';
            case 13:
                return 'D';
            case 14:
                return 'E';
            case 15:
                return 'F';
            default:
                console.error(`GlobalHelpers -> numberToHexChar: Could not convert ${number} to hex character.`);
                return '0';
        }
    }
}
