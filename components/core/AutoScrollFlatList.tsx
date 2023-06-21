import React, { ReactElement, Ref, forwardRef, useImperativeHandle, useRef } from 'react';
import { FlatList, FlatListProps } from 'react-native';

type NullableFlatList<T> = FlatList<T> | null;
export type AutoScrollFlatListRef<T> = NullableFlatList<T> | null & {
    startAutoScroll: (() => void);
};

export type AutoScrollFlatListProps<T> = FlatListProps<T> & {
    ref?: Ref<AutoScrollFlatListRef<T> | null>;
}

const AutoScrollFlatList = forwardRef(<T extends any>(props: AutoScrollFlatListProps<T>, ref: Ref<AutoScrollFlatListRef<T>>) => {
    const flatlistRef = useRef<FlatList<T> | null>(null);

    useImperativeHandle(ref, () => ({
        startAutoScroll() {

        },
    } && flatlistRef.current));

    return(
        <FlatList<T>
            ref={flatlistRef}
            {...props}
        />
    );
}) as unknown;

export default AutoScrollFlatList as <T extends any>(props: AutoScrollFlatListProps<T>) => React.ReactElement;