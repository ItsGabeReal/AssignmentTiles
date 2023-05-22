import { forwardRef, useRef } from "react";
import { FlatList } from "react-native";

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

    function propProvided(prop) {
        if (prop) return true;
        else return false;
    }

    function hasReachedStart(event) {
        const distanceFromTop = event.nativeEvent.contentOffset.y;

        let requiredDistFromTop;
        if (propProvided(onStartReachedThreshold)) requiredDistFromTop = onStartReachedThreshold;
        else requiredDistFromTop = 1;

        return distanceFromTop <= requiredDistFromTop;
    }

    function hasReachedEnd(event) {
        const contentYOffset = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const screenHeight = event.nativeEvent.layoutMeasurement.height;
        const distanceFromEnd = contentHeight - contentYOffset - screenHeight;

        let requiredDistFromBottom;
        if (propProvided(onEndReachedThreshold)) requiredDistFromBottom = onEndReachedThreshold;
        else requiredDistFromBottom = 1;

        return distanceFromEnd <= requiredDistFromBottom;
    }

    function handleScroll(event) {
        if (postLoadDelayComplete.current == true) {
            if (propProvided(onStartReached) && hasReachedStart(event)) {
                onStartReached();
                startPostLoadDelay();
            }
            if (propProvided(onEndReached) && hasReachedEnd(event)) {
                onEndReached();
                startPostLoadDelay();
            }
        }

        if (propProvided(onScroll)) onScroll(event);
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