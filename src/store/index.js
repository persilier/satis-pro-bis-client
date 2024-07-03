import {createStore, combineReducers} from "redux";
import {Provider} from "react-redux";
import {composeWithDevTools} from "redux-devtools-extension";
import languageReducer from "./reducers/languageReducer";
import identityReducer from "./reducers/IdentityReducer";
import authReducer from "./reducers/authReducer";
import planReducer from "./reducers/planReducer";
import treatmentReducer from "./reducers/treatmentReducer";
import yearReducer from "./reducers/yearReducer";


export const rootReducer = combineReducers({
    identity: identityReducer,
    language: languageReducer,
    user: authReducer,
    plan: planReducer,
    treatment:treatmentReducer,
    year:yearReducer
});


export const store = createStore(rootReducer, composeWithDevTools());

export default store;