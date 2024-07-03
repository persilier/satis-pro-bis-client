export const formatUnits = (listUnits) => {
    const newListUnits = [];
    for (let i = 0; i<listUnits.length; i++)
        newListUnits.push({id: listUnits[i].id, name: listUnits[i].name, lead: listUnits[i].lead ? listUnits[i].lead : {}});
    return newListUnits;
};
