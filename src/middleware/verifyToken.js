import {logout} from "../helpers/function";

export const verifyTokenExpire = () => {
    if (new Date() > new Date(localStorage.getItem('date_expire'))) {
        logout();
        return false;
    }
    else {
        return true;
    }
};
