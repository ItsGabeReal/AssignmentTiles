import React from "react";
import MainScreen from "./screens/MainScreen";
import { Provider } from "react-redux";
import store from "./src/redux/store";

export default function App() {
    return (
        <Provider store={store}>
            <MainScreen />
        </Provider>
    );
}