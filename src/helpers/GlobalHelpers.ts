import {
    TextInput,
    Keyboard,
    Platform,
    Vibration,
} from 'react-native';

/**
 * Tl:Dr - This fixes an Android bug.
 * 
 * There's this thing on Android where the text input can be
 * focused but not have the keyboard pulled up, in which case
 * calling ref.current?.focus() doesn't pull up the keyboard.
 * So this function calls blur before focus. That way the
 * keyboard opens every time.
 */
export function focusTextInput(ref: React.RefObject<TextInput>) {
    if (Keyboard.isVisible()) {
        ref.current?.focus();
    }
    else {
        ref.current?.blur();
        ref.current?.focus();
    }
}

export function clamp(value: number, min: number, max: number) {
    if (value < min) return min;
    if (value > max) return max;

    return value;
}

export function vibrate(type?: 'quick') {
    if (Platform.OS == 'android') Vibration.vibrate(10);
}