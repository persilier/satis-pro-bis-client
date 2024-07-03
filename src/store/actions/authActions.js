export const LOGOUT_USER = "LOGOUT_USER";
export const UPDATE_USER="UPDATE_USER";

export const logoutUser = () => {
    return { type: LOGOUT_USER }
};

export const updateUser=(data)=>{
    return{type:UPDATE_USER, data: data}
};
