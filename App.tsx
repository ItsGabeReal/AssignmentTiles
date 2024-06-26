import React from "react";
import MainScreen from "./screens/MainScreen";
import { Provider } from "react-redux";
import { store, persistedStore } from "./src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { StatusBar } from "react-native";
import DropdownMenuProvider from "./components/core/dropdown/DropdownMenuProvider";
import UndoPopupOverlay from "./components/UndoPopupOverlay";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colorTheme } from "./src/GlobalStyles";

export default function App() {
    return (
        <SafeAreaProvider>
            <Provider store={store}>
                <PersistGate persistor={persistedStore}>
                    <UndoPopupOverlay>
                        <DropdownMenuProvider>
                            <StatusBar
                                translucent
                                backgroundColor='#0000'
                                barStyle={colorTheme === 'dark' ? 'light-content' : 'dark-content'}
                            />
                            <MainScreen />
                        </DropdownMenuProvider>
                    </UndoPopupOverlay>
                </PersistGate>
            </Provider>
        </SafeAreaProvider>
    );
}