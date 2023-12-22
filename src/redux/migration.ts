import { PersistedState } from "redux-persist";
import { RootState as RootStateV0 } from "../../types/store-v0";
import { RootState as RootStateV1 } from "../../types/store-v1";
import { latestStoreVersion } from "./store";

/**
 * These methods should convert FROM the version in the key TO the next version.
 * Example: '0: (state) => {}' converts FROM version 0 TO version 1.
 */
const migrations = {
    0: (state: PersistedState) => {
        const oldState = { ...state } as RootStateV0;

        const newState: RootStateV1 = {
            ...oldState,
            categories: {
                current: oldState.categories,
                backup: null,
            },
            events: {
                current: oldState.events,
                backup: null,
            },
            rowPlans: {
                current: oldState.rowPlans,
                backup: null,
            }
        };

        return newState;
    },
}

export default function migrate(state: PersistedState) {
    if (!state) return Promise.resolve(state);

    const currentVersion = state._persist.version;
    if (currentVersion === latestStoreVersion) {
        console.log('Store is up to date');
        return Promise.resolve(state);
    }
    else if (currentVersion < latestStoreVersion) {
        console.log(`Store is outdated`);
    }
    
    /**
     * Sequentually run store translation functions until the data is translated
     * into the latest version.
     * Example, updating store from v0 -> v3: Translate v0 -> v1, then v1 -> v2, then v2 -> v3.
     */
    let output = {...state};
    for (let i = currentVersion; i < latestStoreVersion; i++) {
        console.log(`translating store form v${i} to v${i+1}`);

        const newState = migrations[i](output); // <- typescript is whining but this should be perfectly fine

        output = newState;
    }

    console.log(`Store updated from v${currentVersion} -> v${latestStoreVersion}.`);

    return Promise.resolve(output);
}