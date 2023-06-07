import React from "react";
import { EventDataContextProvider } from "./context/EventDataContext";
import { CategoryContextProvider } from "./context/CategoryContext";
import MainScreen from "./screens/MainScreen";

export default function App() {
    return (
        <EventDataContextProvider>
            <CategoryContextProvider>
                <MainScreen/>
            </CategoryContextProvider>
        </EventDataContextProvider>
    );
}