import { StyleSheet } from "react-native";

const VisualSettings = {
    App: {
        dayRowSeparater: {
            height: StyleSheet.hairlineWidth,
        },
    },
    DayRow: {
        dateTextContainer: {
            width: 80,
            borderRightWidth: StyleSheet.hairlineWidth,
        },
        flatListContainer: {
            paddingLeft: 5,
            paddingTop: 5,
        },
        numEventTileColumns: 3,
    },
    EventTile: {
        mainContainer: {
            height: 80,
            width: 80,
            marginRight: 5,
            marginBottom: 5,
        },
    },
}

export default VisualSettings;