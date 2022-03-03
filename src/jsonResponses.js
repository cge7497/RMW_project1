const players = {};
let playerMovementThisSecond = [];

const resetMovement = () => {
  playerMovementThisSecond=[];
}

setInterval(resetMovement, 1000);


// writes a status header and a JSON object to the response.
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// writes a status header to the response.
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// return user object as JSON
const getPlayers = (request, response) => {
  const responseJSON = {
    players,
  };

  respondJSON(request, response, 200, responseJSON);
};

// add a user/player from the body of a POST request
const addPlayer = (request, response, body) => {
  // default json message
  let responseJSON = {
    message: 'Both name and color are required.',
  };

  if (!body.name || !body.color) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (!players[body.name]) {
    responseCode = 201;
    players[body.name] = {
      name: body.name,
      color: body.color,
      items: {
        morphball: false,
        screwattack: false,
      },
    };
  }

  // update the items and currently unused age value.
  if (body.age) players[body.name].age = body.age;

  if (body.items) players[body.name].items = body.items;

  responseJSON = {
    player: players[body.name],
  };

  if (responseCode === 201) {
    return respondJSON(request, response, responseCode, responseJSON);
  }

  players[body.name].color = body.color;
  // This returns if the player already existed.
  return respondJSON(request, response, 200, responseJSON);
};

// get an existing player/user.
const getPlayer = (request, response, body) => {
  // default json message
  let responseJSON = {
    message: 'A name parameter is required.',
  };

  if (!body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  if (!players[body.name]) {
    responseCode = 400;
    responseJSON.id = 'invalidParams';
    responseJSON.message = `A player of the name ${body.name} does not exist.`;
  } else {
    responseJSON = {
      player: players[body.name],
    };
  }

  return respondJSON(request, response, responseCode, responseJSON);
};

// How am I going to structure this?... (NOT IMPLEMENTED)
// On client, record 30 frames of movement.
// Alarm to run it once every second to send for request.

// adds to the global movement array for this second.
const addMovement = (request, response, body) => {
  const responseJSON = {
    message: 'This endpoint requires a player JSON object with a name, color, and array of >=30 JSON objects with an X, Y, and flipped variable. They were not present in the request.',
    id: 'missingParams',
  };

  if (!body.movement) return respondJSON(request, response, 400, responseJSON);

  const movement = JSON.parse(body.movement);

  if (!movement.name || !movement.color || !movement.movement) {
    return respondJSON(request, response, 400, responseJSON);
  }

  if (!players[movement.name]) {
    responseJSON.id = 'invalidPlayer';
    responseJSON.message = `The player '${body.name}' does not exist on the server.`;
    return respondJSON(request, response, 400, responseJSON);
  }

  playerMovementThisSecond.push(movement);

  return respondJSONMeta(request, response, 204);
};

// update the items of a player
const updateItems = (request, response, body) => {
  const responseJSON = {
    message: 'Name and item are required.',
  };

  if (!body.name || !body.item) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  if (!players[body.name]) {
    responseJSON.id = 'invalidPlayer';
    responseJSON.message = 'The request had the required parameters, but a player of that name does not exist on the server.';
    return respondJSON(request, response, 400, responseJSON);
  }

  // add or update fields for this user name
  players[body.name].items[body.item] = true;

  // This returns if the player was updated.
  return respondJSONMeta(request, response, 204);
};

const getOtherMovement = (request, response) => {
  const responseJSON = {
    playerMovementThisSecond,
  };
  respondJSON(request, response, 200, responseJSON);
};

// Responds with status code 304 (Not Modified)
// if there has been 1 or less player movement stats in the last second,
// or status 100 (Continue) if there was other player movement recently.
const getOtherMovementMeta = (request, response) => {
  if (playerMovementThisSecond.length <= 1) {
    respondJSONMeta(request, response, 304);
  } else respondJSONMeta(request, response, 100);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

// public exports
module.exports = {
  getPlayers,
  getPlayer,
  addPlayer,
  notFound,
  addMovement,
  updateItems,
  getOtherMovement,
  getOtherMovementMeta,
};
