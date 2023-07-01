import { PersistedState } from "redux-persist";
import { RootStateV0 } from "../../types/v0";
import { latestStoreVersion } from "./store";

/**
 * These methods should convert FROM the version in the key TO the next version.
 * Example: '0: (state) => {}' converts FROM version 0 TO version 1.
 */
const migrations = {
    /*0: (state: PersistedState) => {
        const currentState = { ...state } as RootStateV0;
        const newState = { ...state } as RootStateV0;

        // Map events where completed is flipped
        newState.events = currentState.events.map(item => {
            return {
                ...item,
                completed: !item.completed,
            }
        });

        return newState;
    },
    1: (state: PersistedState) => {
        const currentState = { ...state } as RootStateV0;
        const newState = { ...state } as RootStateV0;

        // Map events where name is changed
        newState.events = currentState.events.map(item => {
            return {
                ...item,
                details: {
                    ...item.details,
                    name: item.details.name.concat('!'),
                }
            }
        });

        return newState;
    },*/
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