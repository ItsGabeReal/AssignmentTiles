import React from "react";
import { EventsContextProvider } from "./context/EventsContext";
import { CategoryContextProvider } from "./context/CategoryContext";
import MainScreen from "./screens/MainScreen";

export default function App() {
    return (
        <EventsContextProvider>
            <CategoryContextProvider>
                <MainScreen/>
            </CategoryContextProvider>
        </EventsContextProvider>
    );
}