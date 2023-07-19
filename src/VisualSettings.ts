import { Dimensions } from "react-native";

const VisualSettings = {
    App: {
        dayRowSeparater: {
            height: 6,
        },
    },
    DayRow: {
        dateTextContainer: {
            width: 70,
        },
        flatListContainer: {
            paddingLeft: 8,
            paddingTop: 8,
        },
    },
    EventTile: {
        mainContainer: {
            height: 90,
            width: 90,
            marginRight: 8,
            marginBottom: 8,
        },
    },
}

export function getNumEventColunms() {
    const { width } = Dimensions.get('screen');

    const dateAreaWidth = VisualSettings.DayRow.dateTextContainer.width;
    const tileWidth = VisualSettings.EventTile.mainContainer.width + VisualSettings.EventTile.mainContainer.marginRight;

    const tileContainerWidth = width - dateAreaWidth;

    const numTilesThatFitInContainer = Math.floor(tileContainerWidth / tileWidth);

    // Always return at least 1
    return numTilesThatFitInContainer < 1 ? 1 : numTilesThatFitInContainer;
}

export default VisualSettings;