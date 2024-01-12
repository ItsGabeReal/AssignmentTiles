import React from "react";
import MainScreen from "./screens/MainScreen";
import { Provider } from "react-redux";
import { store, persistedStore } from "./src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { StatusBar } from "react-native";
import DropdownMenuProvider from "./components/core/DropdownMenuProvider";

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistedStore}>
                <DropdownMenuProvider>
                    <StatusBar
                        translucent
                        backgroundColor='#00000040'
                        barStyle='light-content'
                    />
                    <MainScreen />
                </DropdownMenuProvider>
            </PersistGate>
        </Provider>
    );
}