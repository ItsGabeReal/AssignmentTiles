import React, { memo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextStyle,
} from "react-native";
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import VisualSettings from '../src/VisualSettings';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAppSelector } from '../src/redux/hooks';
import { nullEvent } from '../src/EventHelpers';
import { fontSizes } from '../src/GlobalStyles';
import { RGBAToColorValue, gray, mixColor } from '../src/ColorHelpers';

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
    const event = useAppSelector(state => state.events.current[props.eventID]) || nullEvent;
    const categories = useAppSelector(state => state.categories.current);
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
        let output = gray;

        if (event.details.categoryID !== null) {
            output = categories[event.details.categoryID].color;
        }
        
        if (event.completed) {
            output = mixColor(output, gray, 0.5);
        }
        
        return RGBAToColorValue(output);
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
                <Icon name='check' size={60} color='#0e0' />
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
                <Icon name='check' size={24} color='black' />
            </View>
        )
    }

    return (
        <>
            <View style={styles.mainContainer}>
                <View style={[styles.tileBackground, { backgroundColor: getBackgroundColor(), opacity: event.completed ? 0.25 : 1 }]}>
                    <Text style={styles.eventNameText}>{event.details.name}</Text>
                    {event.details.dueDate && props.plannedDate ?
                        <Text style={[styles.dueDateText, getDueDateStyle()]}>{getDueDateText()}</Text>
                        : <></>
                    }
                </View>
                {/*event.completed ? completedCheckmarkView() : */null}
                {isSelected ? <View style={styles.selectedColorOverlay} /> : null}
            </View>
            {isSelected ? selectedIcon() : null}
        </>
        
    );
}, (prevProps, newProps) => prevProps.eventID === newProps.eventID);

const styles = StyleSheet.create({
    mainContainer: {
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
        borderRadius: 13,
        overflow: 'hidden'
    },
    tileBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    selectedColorOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderWidth: 4,
        borderRadius: 13,
        borderColor: 'white'
    },
    selectedCheckIconContainer: {
        position: 'absolute',
        transform: [
            { translateX: -8 },
            { translateY: -8 },
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