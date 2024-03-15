import React, { forwardRef, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ViewToken,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import DayRow from './DayRow';
import VisualSettings from '../src/VisualSettings';
import { getDayRowHeight, getDayRowYOffset } from '../src/helpers/VisibleDaysHelpers';
import { visibleDaysActions } from '../src/redux/features/visibleDays/visibleDaysSlice';
import { RowPlan } from '../types/store-current';

type DayListProps = {
    /**
     * Called by DayList when the event creator should open.
     */
    onRequestOpenEventCreator: ((suggestedDate: DateYMD) => void);

    /**
     * Called when the visibility of the row representing today's date
     * changes. Should be used to set the visibility of the 'return to
     * today' buttons.
     */
    onTodayRowVisibilityChanged: ((newVisibility: 'visible' | 'beneath' | 'above') => void);

    /**
     * Called when the list is scrolled.
     */
    onScroll: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void);

    /**
     * Called when the list is dragged up to the top and new rows are
     * added. If the use is currently drag scrolling, the drag scroll
     * offset should be shifted by the height of the new rows.
     */
    onStartReached?: ((heightOfNewRows: number) => void);
}

const DayList =forwardRef<FlatList, DayListProps>((props, ref) => {
    const dispatch = useAppDispatch();

    const visibleDays = useAppSelector(state => state.visibleDays);

    // This is a sneaky hack to retrieve the rowPlans state without triggering a rerender.
    const rowPlans_closureSafeRef = useRef<{[key: string]: RowPlan}>({});
    const rowPlans = useAppSelector(state => {
        rowPlans_closureSafeRef.current = state.rowPlans.current;
        return null
    });
    //const rowPlans = useAppSelector(state => state.rowPlans.current);

    function renderItem({ item }: { item: DateYMD }) {
        return <DayRow
            date={item}
            onPress={(gesture, rowDate) => props.onRequestOpenEventCreator(rowDate)}
        />;
    };

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(data: ArrayLike<DateYMD> | null | undefined, index: number) {
        return ({
            length: getDayRowHeight(rowPlans_closureSafeRef.current, visibleDays[index]),
            offset: getDayRowYOffset(visibleDays, rowPlans_closureSafeRef.current, index),
            index
        });
    }

    const onViewableItemsChanged = useCallback(
        ({ viewableItems, changed }: { viewableItems: ViewToken[], changed: ViewToken[] }) => {
            const keyForTodayRow = DateYMDHelpers.toString(DateYMDHelpers.today());
            const todaysRow = changed.find(item => item.key === keyForTodayRow);
            const todayVisibilityChanged = todaysRow !== undefined;

            if (todayVisibilityChanged) {
                if (todaysRow.isViewable) {
                    props.onTodayRowVisibilityChanged('visible');
                }
                else {
                    if (!viewableItems[0]) return;
                    const firstViewableItem = viewableItems[0].index || -1;
                    const todaysIndex = todaysRow.index || -1;

                    if (firstViewableItem === todaysIndex) return; // This is a case that often occurs. Ignoring it doesn't seem to cause issues.

                    const todaysRowIsAbove = firstViewableItem > todaysIndex;
                    if (todaysRowIsAbove) {
                        props.onTodayRowVisibilityChanged('above');
                    }
                    else {
                        props.onTodayRowVisibilityChanged('beneath');
                    }
                }
            }
        },
        []
    );

    const NUM_NEW_DAYS = 14;
    function onStartReached() {
        dispatch(visibleDaysActions.addDaysToTop({ numNewDays: NUM_NEW_DAYS }));

        const heightOfAddedRows = getHeightOfAddedRows(NUM_NEW_DAYS, visibleDays[0]);
        props.onStartReached?.(heightOfAddedRows);
    }

    function getHeightOfAddedRows(numAddedRows: number, dateOfFirstNewRow: DateYMD) {
        const addedDaysArray = DateYMDHelpers.createSequentialDateArray(DateYMDHelpers.subtractDays(dateOfFirstNewRow, numAddedRows), numAddedRows);
        const heightOfNewRows = getDayRowYOffset(addedDaysArray, rowPlans_closureSafeRef.current, numAddedRows);
        return heightOfNewRows;
    }

    function onEndReached() {
        dispatch(visibleDaysActions.addDaysToBottom({ numNewDays: NUM_NEW_DAYS }));
    }

    return (
        <FlatList
            ref={ref}
            data={visibleDays}
            keyExtractor={item => DateYMDHelpers.toString(item)}
            renderItem={renderItem}
            ItemSeparatorComponent={DayRowSeparater}
            getItemLayout={getItemLayout}
            initialScrollIndex={visibleDays.findIndex(item => DateYMDHelpers.isToday(item))}
            //scrollEnabled <- Instead of using a state here, I'm using flatListRef.setNativeProps({ scrollEnabled: true/false }). This way changing it doesn't cause a rerender.
            onScroll={props.onScroll}
            onViewableItemsChanged={onViewableItemsChanged}
            onStartReached={onStartReached}
            onStartReachedThreshold={1}
            onEndReached={onEndReached}
            onEndReachedThreshold={1}
            maintainVisibleContentPosition={{ minIndexForVisible: 2 }}
            showsVerticalScrollIndicator={false}
        />
    )
});

const styles = StyleSheet.create({
    dayRowSeparater: {
        height: VisualSettings.App.dayRowSeparater.height,
    }
});

export default DayList;