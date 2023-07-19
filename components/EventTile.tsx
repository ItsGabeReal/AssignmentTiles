import React, { memo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ColorValue,
    TextStyle,
} from "react-native";
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import VisualSettings from '../src/VisualSettings';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAppSelector } from '../src/redux/hooks';
import { getCategoryFromID } from '../src/redux/features/categories/categoriesSlice';
import { nullEvnet } from '../src/EventHelpers';
import { fontSizes } from '../src/GlobalStyles';

type EventTileProps = {
    /**
     * The id of the event this tile represents.
     */
    eventID: string;

    /**
     * The date on which this event is scheduled.
     */
    plannedDate?: DateYMD;
}

const EventTile: React.FC<EventTileProps> = memo((props) => {
    const event = useAppSelector(state => state.events.find(item => item.id === props.eventID)) || nullEvnet;
    const categories = useAppSelector(state => state.categories);
    const isSelected = useAppSelector(state => state.general.multiselect.selectedEventIDs.find(item => item === props.eventID) !== undefined);

    const daysPlannedBeforeDue = getDaysPlannedBeforeDue();
    const overdue = daysPlannedBeforeDue !== undefined ? (daysPlannedBeforeDue < 0) : false;

    function getDaysPlannedBeforeDue() {
        if (!props.plannedDate) return;

        if (event.details.dueDate) {
            return DateYMDHelpers.daysBefore(event.details.dueDate, props.plannedDate);
        }
    }

    function getBackgroundColor() {
        let outputColorValue: ColorValue = '#fff';

        if (event.details.categoryID !== null) {
            const category = getCategoryFromID(categories, event.details.categoryID);
            if (!category) {
                console.error('EventTile/getBackgroundColor: Could not find category from id');
            }
            else {
                outputColorValue = category.color;
            }
        }

        return outputColorValue;
    }

    function getDueDateText() {
        if (daysPlannedBeforeDue !== undefined) {
            if (daysPlannedBeforeDue > 0) {
                return `${daysPlannedBeforeDue} ${daysPlannedBeforeDue === 1 ? 'day' : 'days'} early`;
            }
            else if (daysPlannedBeforeDue < 0) {
                return `${daysPlannedBeforeDue * -1} ${daysPlannedBeforeDue === -1 ? 'day' : 'days'} late`;
            }
            else {
                return 'On Time';
            }
        }

        return '';
    }

    function completedCheckmarkView() {
        return (
            <View style={styles.checkmarkOverlayContainer}>
                {/* Don't show the completed checkmark if it's selected during multi-select */}
                {!isSelected ? <Icon name='check' size={60} color='#0d0' /> : <></>}
            </View>
        );
    }

    function getDueDateStyle(): TextStyle {
        if (overdue) return {
            color: '#f00',
            fontSize: fontSizes.p,
            fontWeight: 'bold',
        }
        else return {
            color: '#fff8',
            fontSize: fontSizes.small,
        }
    }

    function selectedIcon() {
        return (
            <View style={styles.selectedCheckIconContainer}>
                <Icon name='check' size={30} color='black' />
            </View>
        )
    }

    return (
        <>
            <View style={styles.mainContainer}>
                <View style={[styles.tileBackground, { backgroundColor: getBackgroundColor(), opacity: event.completed ? 0.25 : 1 }]}>
                    <View style={styles.colorDimmer}>
                        <Text style={styles.eventNameText}>{event.details.name}</Text>
                        {event.details.dueDate && props.plannedDate ?
                            <Text style={[styles.dueDateText, getDueDateStyle()]}>{getDueDateText()}</Text>
                            : <></>
                        }
                    </View>
                </View>
                {event.completed ? completedCheckmarkView() : null}
                {isSelected ? <View style={[StyleSheet.absoluteFill, styles.selectedColorOverlay]} /> : null}
            </View>
            {isSelected ? selectedIcon() : null}
        </>
        
    );
}, (prevProps, newProps) => prevProps.eventID === newProps.eventID);

const styles = StyleSheet.create({
    mainContainer: {
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
        marginRight: VisualSettings.EventTile.mainContainer.marginRight,
        marginBottom: VisualSettings.EventTile.mainContainer.marginBottom,
        borderRadius: 10,
        overflow: 'hidden'
    },
    tileBackground: {
        flex: 1,
    },
    colorDimmer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0004',
        padding: 5,
    },
    selectedColorOverlay: {
        backgroundColor: '#04f8',
    },
    selectedCheckIconContainer: {
        position: 'absolute',
        transform: [
            { translateX: -10 },
            { translateY: -10 },
        ],
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 1,
    },
    eventNameText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: fontSizes.p,
    },
    dueDateText: {
        marginTop: 0,
    },
    checkmarkOverlayContainer: {
        position: 'absolute',
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default EventTile;