import React from "react";
import MainScreen from "./screens/MainScreen";
import { Provider } from "react-redux";
import { store, persistedStore } from "./src/redux/store";
import { PersistGate } from "redux-persist/integration/react";

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistedStore}>
                <MainScreen />
            </PersistGate>
        </Provider>
    );
}