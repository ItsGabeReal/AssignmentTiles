import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList
} from "react-native";

// Variables outside app are the same across all instances of app
// Variables inside app are unique across each instance of app
// Therefore, I don't think it matters what I do since there is only one instance of app.

/*
Row Format:
  day: String representing day of the week
  date: String representing date in YYYY/MM/DD format. This is used as the key.
*/

/*interface Row {
  
}*/
const rows = [
  {
    day: 'Sun',
    date: new Date(2023, 0, 24)
  },
  {
    day: 'Mon',
    date: new Date(2023, 0, 25)
  },
  {
    day: 'Tue',
    date: new Date(2023, 0, 26)
  },
  {
    day: 'Wed',
    date: new Date(2023, 0, 27)
  },
  {
    day: 'Thu',
    date: new Date(2023, 0, 28)
  },
  {
    day: 'Fri',
    date: new Date(2023, 0, 29)
  },
  {
    day: 'Sat',
    date: new Date(2023, 0, 30)
  },
  {
    day: 'Sun',
    date: new Date(2023, 0, 31)
  },
  {
    day: 'Mon',
    date: new Date(2023, 1, 1)
  },
  {
    day: 'Tue',
    date: new Date(2023, 1, 2)
  }
];

/*
Element Format:
  name: String to be displayed on the element
  type: String representing the type of assignment ('no-date', 'event', 'due-date', 'finish-before', 'finish-after')
  dueDate: Timestamp of the date it must be completed by
  finishBefore: A reference to the assignment this must be completed before
*/

const elements = [
];

// Components
const DayContainer = ({day}) => (
  <View style={styles.rowContainer}>
    <View style={styles.dateContainer}>
      <Text>{day}</Text>
    </View>
    <View style={styles.entryContainer}>

    </View>
  </View>
)

export default function App() {

  // Layout
  return (
    <View style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={item => item.date.getTime()} // FlatLists are supposed to have a keyExtractor, but it seems to work fine without it
        renderItem={({item}) => <DayContainer day={item.day}/>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1
  },
  rowContainer: {
    flex: 1,
    minHeight: 90,
    borderColor: 'black',
    borderWidth: 1,
    flexDirection: 'row'
  },
  dateContainer: {
    flex: 1,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  entryContainer: {
    flex: 4,
    borderWidth: 1
  }
});
