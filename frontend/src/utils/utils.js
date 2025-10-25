/**
 * Converts a "players" object from the backend into an array
 * for the frontend, moving the object key into an 'id' property.
 *
 * @param {object} playersObject - The backend players object.
 * e.g., { "socketId1": { name: "A" }, "socketId2": { name: "B" } }
 * @returns {array} An array of player objects.
 * e.g., [ { id: "socketId1", name: "A" }, { id: "socketId2", name: "B" } ]
 */
export const convertPlayersObjectToArray = (playersObject) => {
  if (!playersObject) {
    return [];
  }

  // Object.entries() gives: [ ["socketId1", { name: "A" }], ["socketId2", { name: "B" }] ]
  // We map this to the format our frontend state needs.
  return Object.entries(playersObject).map(([id, playerData]) => ({
    id: id,
    ...playerData,
  }));
};

/**
 * Converts a "players" array from the frontend back into an object
 * for the backend, using the 'id' property as the key.
 *
 * @param {array} playersArray - The frontend players array.
 * e.g., [ { id: "socketId1", name: "A" }, { id: "socketId2", name: "B" } ]
 * @returns {object} A "players" object in the backend format.
 * e.g., { "socketId1": { name: "A" }, "socketId2": { name: "B" } }
 */
export const convertPlayersArrayToObject = (playersArray) => {
  if (!playersArray) {
    return {};
  }

  // Use reduce to build a new object from the array
  return playersArray.reduce((acc, player) => {
    // Destructure to separate the id from the rest of the data
    const { id, ...playerData } = player;

    // Set the key on the new object
    acc[id] = playerData;

    return acc;
  }, {}); // Start with an empty object
};
