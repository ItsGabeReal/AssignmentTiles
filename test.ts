import { hexToRGBA } from "./src/ColorHelpers";


const categoryColorPalette: string[] = [
    '#DE1212', // Red
    '#E26912', // Orange
    '#C9C91D', // Yellow
    '#2EC610', // Green
    '#10C6C6', // Aqua
    '#2F60EE', // Blue
    '#A22FEE', // Purple
    '#E212E2', // Pink
];

for (let str in categoryColorPalette) {
    console.log(str);
    
    const rgba = hexToRGBA(str);

    console.log(`\t{r:${rgba.r},g:${rgba.g},b:${rgba.b},a:${rgba.a}},`);
}