import { PersistedState } from "redux-persist";
import { RootState as RootStateV0 } from "../../types/store-v0";
import { RootState as RootStateV1 } from "../../types/store-v1";
import { RootState as RootStateV2, Category as CategoryV2, Event as EventV2, RowPlan as RowPlanV2 } from "../../types/store-v2";
import { latestStoreVersion } from "./store";
import { DateYMDHelpers } from "../DateYMD";

/**
 * These methods should convert FROM the version in the key TO the next version.
 * Example: '0: (state) => {}' converts FROM version 0 TO version 1.
 */
const migrations = {
    0: (state: PersistedState) => {
        const oldState = { ...state } as RootStateV0;

        /**
         * V1 Update Notes:
         * 
         * Added a backup property to categories, events, and rowPlans so that
         * destructive actions can be undone.
         */

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
    1: (state: PersistedState) => {
        const oldState = { ...state } as RootStateV1;

        /**
         * V2 Update Notes:
         * 
         * Categories, events, and rowPlans are now stored in large objects with key lookups
         * instead of being stored in an array. This massively improves search time when finding
         * an element.
         * 
         * CategoryID has been removed and category objects can no longer have a null id (not sure
         * why that was a thing to begin with).
         */

        // Convert categories
        const oldCategories = oldState.categories.current;
        const newCategories: {[key: string]: CategoryV2} = {};
        for (let i = 0; i < oldCategories.length; i++) {
            // Remove null posibility from category id (it should have been impossible for a category to be assigned a null id)
            const oldID = oldCategories[i].id;
            const newID = oldID === null ? "null" : oldID;

            // Create entry
            newCategories[newID] = {
                name: oldCategories[i].name,
                color: oldCategories[i].color
            };
        }

        // Convert events
        const oldEvents = oldState.events.current;
        const newEvents: {[key: string]: EventV2} = {};
        for (let i = 0; i < oldEvents.length; i++) {
            newEvents[oldEvents[i].id] = {
                details: oldEvents[i].details,
                completed: oldEvents[i].completed
            };

        }

        // Convert row plans
        const oldRowPlans = oldState.rowPlans.current;
        const newRowPlans: {[key: string]: RowPlanV2} = {};
        for (let i = 0; i < oldRowPlans.length; i++) {
            const key = DateYMDHelpers.toString(oldRowPlans[i].plannedDate);
            newRowPlans[key] = oldRowPlans[i];
        }

        // Assemble updated state
        const newState: RootStateV2 = {
            ...oldState,
            categories: {
                current: newCategories,
                backup: null,
            },
            events: {
                current: newEvents,
                backup: null,
            },
            rowPlans: {
                current: newRowPlans,
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
