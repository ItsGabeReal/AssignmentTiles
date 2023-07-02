import {
    TextInput,
    Keyboard,
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