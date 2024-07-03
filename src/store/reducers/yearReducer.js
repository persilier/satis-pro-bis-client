import { LOAD_YEAR} from "../actions/yearAction";

const initialState = {
    year: undefined,
};

const yearReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_YEAR:
            return {
                year: action.year
            };
        default :
            return state;
    }
};

export default yearReducer;
