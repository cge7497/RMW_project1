const players = {};
const playerMovementThisSecond = {};

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

//return user object as JSON
const getPlayers = (request, response) => {
  const responseJSON = {
    players,
  };

  respondJSON(request, response, 200, responseJSON);
};

//add a user/player from the body of a POST request
const addPlayer = (request, response, body) => {
  //default json message
  const responseJSON = {
    message: 'Both name and color are required.',
  };

  console.log(`name: ${body.name} color:${body.color}`);
  
  if (!body.name || !body.color) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (!users[body.name]) {
    responseCode = 201;
    users[body.name] = {};
  }

  //add or update fields for this user name
  users[body.name].name = body.name;
  //update the optional age value if it was sent.
  if (body.age) users[body.name].age = body.age; 

  responseJSON = users[body.name];

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  //This returns if the player was updated.
  return respondJSONMeta(request, response, responseCode);
};

// How am I going to structure this?...
// On client, record 30 frames of movement. Once every second frame. Do I record every frame, or every second?
// Alarm to run it once every second to send for request.

//adds to the global movement array for this second.
const addMovement = (request, response, body) => {
  const responseJSON = {
    message: 'This endpoint requires an array of 30 JSON objects with an X, Y, and flipped variable. They were not present in the request.',
  };

  if (!body.movement || body.movement.length < 30) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (!users[body.name]) {
    responseCode = 201;
    users[body.name] = {};
  }

  return respondJSONMeta(request, response, responseCode);
};

const getOtherMovement = (request, response) => {
    const responseJSON = {
      playerMovementThisSecond,
    };
    respondJSON(request, response, 200, responseJSON);
}

// Responds with status code 304 (Not Modified) if there has been 1 or less player movement stats in the last second,
// or status 100 (Continue) if there was other player movement recently.
const getOtherMovementMeta = (request, response) => {
  if (playerMovementThisSecond.length <= 1){
    respondJSONMeta(request, response, 304);
  }
  else respondJSONMeta(request, response, 100);
}


const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

//public exports
module.exports = {
  getPlayers,
  addPlayer,
  notFound,
  addMovement,
  getOtherMovement,
  getOtherMovementMeta
};