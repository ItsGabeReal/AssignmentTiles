import React, { MutableRefObject, forwardRef, useRef } from "react";
import {
    FlatList,
    FlatListProps,
    NativeScrollEvent,
    NativeSyntheticEvent
} from "react-native";

type InfiniteScrollFlatListProps<T> = FlatListProps<T> & {
    /**
     * Called when the scroll y position reaches the top of content
     * within the threshold specified by onSTartReachedThreshold.
     */
    onStartReached?: () => void;

    /**
     * Called when the scroll y position reaches the bottom of content
     * within the threshold specified by onEndReachedThreshold.
     */
    onEndReached?: () => void;

    /**
     * The distance in scaled pixels from the top of the content the
     * scroll y offset needs to be to call onStartReached.
     */
    onStartReachedThreshold?: number;

    /**
     * The distance in scaled pixels from the bottom of the content the
     * scroll y offset needs to be to call onEndReached.
     */
    onEndReachedThreshold?: number;


    ref?:
        | ((instance: FlatList<T> | null) => void)
        | MutableRefObject<FlatList<T> | null>
        | null;
};

const InfiniteScrollFlatList = forwardRef(
    <T extends any>(
        props: InfiniteScrollFlatListProps<T>,
        ref:
            | ((instance: FlatList<T> | null) => void)
            | MutableRefObject<FlatList<T> | null>
            | null
    ) => {
    const {
        onScroll,
        onStartReached,
        onEndReached,
        onStartReachedThreshold = 1,
        onEndReachedThreshold = 1,
        ...otherProps
    } = props;

    /**
     * After calling either onStartReached or onEndReached, add a brief delay to allow
     * the scroll Y offset state to update. Otherwise, scrolling to the top/bottom tends
     * to load multiple times which is a problem.
     */
    const postLoadDelayDuration = 500;

    const postLoadDelayComplete = useRef(true);

    function hasReachedStart(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const distanceFromTop = event.nativeEvent.contentOffset.y;
        return distanceFromTop <= onStartReachedThreshold;
    }

    function hasReachedEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const contentYOffset = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const screenHeight = event.nativeEvent.layoutMeasurement.height;
        const distanceFromEnd = contentHeight - contentYOffset - screenHeight;

        return distanceFromEnd <= onEndReachedThreshold;
    }

    function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        if (postLoadDelayComplete.current == true) {
            if (typeof onStartReached === 'function' && hasReachedStart(event)) {
                onStartReached();
                startPostLoadDelay();
            }
            if (typeof onEndReached === 'function' && hasReachedEnd(event)) {
                onEndReached();
                startPostLoadDelay();
            }
        }

        onScroll?.(event);
    }

    function startPostLoadDelay() {
        postLoadDelayComplete.current = false;
        setTimeout(() => {
            postLoadDelayComplete.current = true;
        }, postLoadDelayDuration);
    }

    return (
        <FlatList<T> ref={ref} onScroll={handleScroll} onEndReached={null} {...otherProps} />
    );
}) as unknown;

export default InfiniteScrollFlatList as InfiniteScrollFlatListType;

type InfiniteScrollFlatListType = <T extends any>(props: InfiniteScrollFlatListProps<T>) => React.ReactElement;