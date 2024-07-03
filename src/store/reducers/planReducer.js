import {CHANGE_PLAN, LOAD_PLAN} from "../actions/planAction";

const initialState = {
    plan: undefined,
};

const planReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_PLAN:
            localStorage.setItem('plan', action.plan);
            window.location.href = "/login";
            return {
                plan: action.plan
            };
        case LOAD_PLAN:
            return {
                plan: action.plan
            };
        default :
            return state;
    }
};

export default planReducer;
