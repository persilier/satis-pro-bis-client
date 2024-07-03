export const verifyPermission = (userPermissions, permission) => {
    for (let i=0; i<userPermissions?.length; i++) {
        if (userPermissions[i] === permission)
            return true;
    }
    return false;
};
