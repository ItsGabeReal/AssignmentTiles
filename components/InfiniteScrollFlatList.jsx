import { forwardRef, useRef } from "react";
import { FlatList, ActivityIndicator } from "react-native";

const InfiniteScrollFlatList = forwardRef(function InfiniteScrollFlatList(props, ref) {
    const {
        data,
        onScroll,
        onStartReached,
        onEndReached,
        onStartReachedThreshold,
        onEndReachedThreshold,
        ...otherProps
    } = props;

    /**
     * After calling either onStartReached or onEndReached, add a brief delay to allow
     * the scroll Y offset state to update. Otherwise, scrolling to the top/bottom tends
     * to load multiple times which is a problem.
     */
    const postLoadDelayDuration = 500;

    const postLoadDelayComplete = useRef(true);

    function hasReachedStart(event) {
        const contentYOffset = event.nativeEvent.contentOffset.y;const distanceFromTop = contentYOffset;

        let requiredDistFromTop;
        if (onStartReachedThreshold) requiredDistFromTop = onStartReachedThreshold;
        else requiredDistFromTop = 1;

        return distanceFromTop <= requiredDistFromTop;
    }

    function hasReachedEnd(event) {
        const contentYOffset = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const screenHeight = event.nativeEvent.layoutMeasurement.height;
        const distanceFromEnd = contentHeight - contentYOffset - screenHeight;

        let requiredDistFromBottom;
        if (onEndReachedThreshold) requiredDistFromBottom = onEndReachedThreshold;
        else requiredDistFromBottom = 1;

        return distanceFromEnd <= requiredDistFromBottom;
    }

    function handleScroll(event) {
        if (postLoadDelayComplete.current) {
            if (onStartReached && hasReachedStart(event)) {
                onStartReached();
                startPostLoadDelay();
            }
            if (onEndReached && hasReachedEnd(event)) {
                onEndReached();
                startPostLoadDelay();
            }
        }
        
        if (onScroll) onScroll(event);
    }

    function startPostLoadDelay() {
        postLoadDelayComplete.current = false;
        setTimeout(() => {
            postLoadDelayComplete.current = true;
        }, postLoadDelayDuration);
    }

    return (
        <FlatList ref={ref} data={data} onScroll={handleScroll} onEndReached={null} {...otherProps} />
    );
});

export default InfiniteScrollFlatList;