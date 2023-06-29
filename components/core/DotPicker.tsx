import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    ViewProps,
    StyleProp,
    TextStyle,
    ViewStyle,
} from 'react-native';

export type DotPickerOption = {
    /**
     * The value returned by DotPicker when this option is selected.
     * It should be unique to each option and it should not change.
     */
    value: string;

    displayName: string;

    /**
     * The style for the option container view.
     */
    containerStyle?: StyleProp<ViewStyle>;

    /**
     * The children shown under this option view.
     */
    children?: React.ReactNode;
}

type DotPickerProps = ViewProps & {
    /**
     * Details about the available options.
     */
    options: DotPickerOption[];

    /**
     * Called when the selected item changes.
     */
    onChange?: ((newSelection: string) => void);

    /**
     * The style of the option name text.
     */
    textStyle?: StyleProp<TextStyle>;

    /**
     * The option initially selected upon loading.
     */
    initialValue?: string;

    /**
     * Then amount of hit slop when pressing an option.
     */
    hitSlop?: number;
};

const DotPicker: React.FC<DotPickerProps> = (props) => {
    const {
        onChange,
        ...otherProps
    } = props;
    const [selectedValue, setSelectedValue] = useState(props.initialValue || props.options[0].value);

    function handleSelection(newValue: string) {
        if (newValue === selectedValue) return;

        setSelectedValue(newValue);
        onChange?.(newValue);
    }

    return (
        <View {...otherProps}>
            {props.options.map(item =>
                <DotPickerItem
                    key={item.value}
                    details={item}
                    selected={selectedValue === item.value}
                    onSelected={handleSelection}
                    textStyle={props.textStyle}
                    hitSlop={props.hitSlop}
                />
            )}
        </View>
    )
}

type DotPickerItemProps = {
    details: DotPickerOption;

    selected: boolean;

    onSelected?: ((value: string) => void);

    textStyle?: StyleProp<TextStyle>;

    hitSlop?: number;
};

const DotPickerItem: React.FC<DotPickerItemProps> = (props) => {
    return (
        <View style={props.details.containerStyle}>
            <Pressable onPress={() => props.onSelected?.(props.details.value)} style={styles.flexRow} hitSlop={props.hitSlop}>
                <View style={styles.outerDot}>
                    {props.selected ? <View style={styles.innerDot} /> : <></>}
                </View>
                <Text style={props.textStyle}>{props.details.displayName}</Text>
            </Pressable>
            <View pointerEvents={props.selected ? 'auto' : 'none'} style={{opacity: props.selected ? 1 : 0.5}}>
                {props.details.children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    outerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        padding: 5,
        backgroundColor: '#808080',
    },
    innerDot: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 10,
    }
});

export default DotPicker;