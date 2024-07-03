import {ADD_IDENTITY} from "../actions/IdentityAction";

const initialState = {
    identite: {
        firstname: "",
        lastname: "",
        sexe: "",
        ville: "",
        telephone: [],
        email: [],
        client_id: [],
        institution_id: []
    }
};

export default function identityReducer(state = initialState, actions) {
    switch (actions.type) {
        case ADD_IDENTITY:
            const data = actions.data;
            return {
                firstname: data.firstname,
                lastname: data.lastname,
                sexe: data.sexe,
                ville: data.ville,
                telephone: data.telephone,
                email: data.email,
                client_id: data.client_id,
                institution_id: data.institution_id
            };
        default:
    }
    return state;
};
