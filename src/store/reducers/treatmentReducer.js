import {ADD_TREATMENT} from "../actions/treatmentAction";

const initialState = {
        amount_returned: "",
        solution: "",
        comments: "",
        preventive_measures: "",
};

export default function treatmentReducer(state = initialState, actions) {
    switch (actions.type) {
        case ADD_TREATMENT:
            const data = actions.data;
            return {
                amount_returned: data.amount_returned,
                solution: data.solution,
                comments: data.comments,
                preventive_measures: data.preventive_measures,
            };
        default:
    }
    return state;
};
