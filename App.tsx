import React, { useEffect } from "react";
import MainScreen from "./screens/MainScreen";
import { Provider } from "react-redux";
import { store, persistedStore } from "./src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import SplashScreen from "react-native-splash-screen";

export default function App() {
    useEffect(() => {
        SplashScreen.hide();
    }, []);

    return (
        <Provider store={store}>
            <PersistGate persistor={persistedStore}>
                <MainScreen />
            </PersistGate>
        </Provider>
    );
}