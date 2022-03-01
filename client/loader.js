import { addPlayer } from '../src/jsonResponses.js';
import * as main from './main.js';

//I got this code from class assignments. In particular https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/client/client.html
const handleResponse = async (response, name) => {

    const content = document.querySelector('#createResponse');
    let success=true;

    //Based on the status code, display something
    switch (response.status) {
        case 200: //success
            content.innerHTML = `<b>Success</b>`;
            break;
        case 201: //created
            content.innerHTML = `<b>Now playing as new player ${name}</b>`;
            break;
        case 204: //updated (no response back from server)
            content.innerHTML = `<b>Logged in as existing user ${name}</b>`;
            return;
        case 400: //bad request
            content.innerHTML = `<b>Bad Request.</b>`; success = false;
            break;
        default: //any other status code
            content.innerHTML = `Error code not implemented by client.`; success=false;
            break;
    }
    //If the player was created/logged in as, run init in the main game code.
    if (success) main.init;
    
    //Parse the response to json. This works because we know the server always
    //sends back json. Await because .json() is an async function.
    let obj = await response.json();

    //If we have a message, display it.
    if (obj.message) {
        content.innerHTML += `<p>${obj.message}</p>`;
    }
};

//Uses fetch to send a postRequest. Marksed as async because we use await
//within it.
const sendPost = async (nameForm) => {

    //Grab all the info from the form
    const name = nameForm.querySelector('#nameField').value;
    const age = nameForm.querySelector('#ageField').value;
    const color = nameForm.querySelector('#colorField').value;
    
    //Build a data string in the FORM-URLENCODED format.
    const formData = `name=${name}&age=${age}&color=${color}`;

    //Make a fetch request and await a response. Set the method to
    //the one provided by the form (POST). Set the headers. Content-Type
    //is the type of data we are sending. Accept is the data we would like
    //in response. Then add our FORM-URLENCODED string as the body of the request.
    let response = await fetch('/addPlayer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: formData,
    });

    //Once we have a response, handle it.
    handleResponse(response, name);
};

//Init function is called when window.onload runs. It hooks up the "Add Player" button t the functions that send the request.
const init = () => {
    const playerForm = document.querySelector('#playerForm');

    const addPlayer = (e) => {
        e.preventDefault();
        sendPost(playerForm);
        return false;
    }

    //Call addUser when the submit event fires on the form.
    playerForm.addEventListener('submit', addPlayer);
};

//When the window loads, run init.
window.onload = init;
