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
            break;
        case 400: //bad request
            content.innerHTML = `<b>Bad Login Request</b>`; 
            success = false;
            break;
        default: //any other status code
            content.innerHTML = `Error code not implemented by client.`; 
            success=false;
            break;
    }
    //If the player was created/logged in as, run init in the main game code.
    if (success) {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.value = "Logged in";
        submitBtn.disabled=true;
        main.init(); 
        return;
    }
    
    //Parse the response to json. This works because we know the server always
    //sends back json. Await because .json() is an async function.
    let obj = await response.json();

    //If we have a message, display it.
    if (obj.message) {
        content.innerHTML += `<p>${obj.message}</p>`;
    }
};

// sends the player data to the server as a POST request.
const sendPlayer = async (nameForm) => {

    //Grab all the info from the form
    const name = nameForm.querySelector('#nameField').value;
    const age = nameForm.querySelector('#ageField').value;
    const color = nameForm.querySelector('#colorField').value;
    
    //Build a data string in the FORM-URLENCODED format.
    const formData = `name=${name}&age=${age}&color=${color}`;

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

//Hooks up the form submission button to the sendPost function.
const init = () => {
    const playerForm = document.querySelector('#playerForm');

    const addPlayer = (e) => {
        e.preventDefault(); //prevents the default action (which would invovle refreshing the page.)
        sendPlayer(playerForm);
        return false;
    }

    //Call addUser when the submit event fires on the form.
    playerForm.addEventListener('submit', addPlayer);
};

//When the window loads, run init.
window.onload = main.init;
