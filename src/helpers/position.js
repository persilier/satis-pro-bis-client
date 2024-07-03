export const formatPositions = (listPositions) => {
    const newListPositions = [];
    for (let i = 0; i<listPositions.length; i++)
        newListPositions.push({id: listPositions[i].id, name: listPositions[i].name});
    return newListPositions;
};
