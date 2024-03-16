/**
 * A button that can be placed at the top and bottom of the screen that should
 * return the view to the today row when pressed.
 * 
 * This is its own component because the state that shows/hides the button should
 * not be in the main screen because it triggers the whole screen to rerender when
 * shown.
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import Button from './Button';
import { colors, fontSizes, globalStyles } from '../src/GlobalStyles';
import { StyleSheet } from 'react-native';

export type ReturnToTodayButtonRef = {
    /**
     * Makes the return to today button visible.
     */
    show: (() => void);

    /**
     * Hides the return to today button.
     */
    hide: (() => void);
}

type ReturnToTodayButtonProps = {
    /**
     * Determines the style and positioning of the button.
     */
    variation: 'above' | 'beneath';

    /**
     * Called when the button is pressed.
     */
    onPress: (() => void);
}

const ReturnToTodayButton = forwardRef<ReturnToTodayButtonRef, ReturnToTodayButtonProps>((props, ref) => {
    const [visible, setVisible] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        show() {
            setVisible(true);
        },
        hide() {
            setVisible(false);
        }
    }));

    if (visible) {
        return (
            <Button
                title="Today"
                titleSize={fontSizes.p}
                iconName={props.variation === 'above' ? 'arrow-upward' : 'arrow-downward'}
                fontColor={colors.text_rgba}
                backgroundColor={colors.todayL2_rgba}
                iconSpacing={5}
                style={[styles.ReturnToTodayButton, globalStyles.dropShadow, props.variation === 'above' ? { position: 'absolute', top: 20 } : { marginBottom: 20 }]}
                onPress={props.onPress}
            />
        )
    }
    else return null;
});

const styles = StyleSheet.create({
    ReturnToTodayButton: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 10,
    },
});

export default ReturnToTodayButton;