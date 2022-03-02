const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/bundle.js': htmlHandler.getBundle,
    '/getPlayers': jsonHandler.getPlayers,
    '/getOtherMovement': jsonHandler.getOtherMovement,
    '/favicon.ico': htmlHandler.getFavicon,
    '/screwattack.png': htmlHandler.getScrewAttack,
    '/morphball.png': htmlHandler.getMorphBall,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getOtherMovementMeta': jsonHandler.getOtherMovementMeta,
    notFound: jsonHandler.notFound,
  },
  POST: {
    '/addPlayer': jsonHandler.addPlayer,
    '/addMovement': jsonHandler.addMovement
  },
};

// I took this code from the class repo: https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/src/server.js
const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    //Once we have the bodyParams object, we will call the handler function. We then
    //proceed much like we would with a GET request.
    handler(request, response, bodyParams);
  });
};

// Handles when the server gets a request. Uses the request data to figure put what to send back.
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const queryParams = query.parse(parsedUrl.query);

  let { method } = request;
  if (!request.method) method = 'GET'; // defaults to a GET method as described in assignment


  if (method === 'POST')
    return parseBody(request, response, urlStruct[method][parsedUrl.pathname]);

  if (urlStruct[method][parsedUrl.pathname]) {
    urlStruct[method][parsedUrl.pathname](request, response, queryParams);
  } else {
    urlStruct[method].notFound(request, response);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
