export const formatInstitutions = (listInstitutions) => {
    const newListInstitutions = [];
    for (let i = 0; i<listInstitutions.length; i++)
        newListInstitutions.push({id: listInstitutions[i].id, name: listInstitutions[i].name});
    return newListInstitutions;
};
