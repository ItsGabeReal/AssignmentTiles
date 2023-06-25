/**
 * A custom text component to standardize styling.
 */

import React from 'react';
import {
    Text,
    TextProps,
    TextStyle,
} from 'react-native';
import { textStyles } from '../src/GlobalStyles';

export type StdTextProps = TextProps & {
    /**
     * Style of text.
     */
    type?: 'title' | 'h1' | 'h2' | 'h3' | 'p';
}

const StdText: React.FC<StdTextProps> = (props) => {
    const {
        type = 'p',
        style,
        ...otherProps
    } = props;

    function getTextStyleFromType(): TextStyle {
        switch (type) {
            case 'title':
                return textStyles.title;

            case 'h1':
                return textStyles.h1;

            case 'h2':
                return textStyles.h2;

            case 'h3':
                return textStyles.h3;

            case 'p':
                return textStyles.p;

            default:
                return textStyles.p;
        }
    }

    return (
        <Text style={[getTextStyleFromType(), style]} {...otherProps} />
    );
}

export default StdText;