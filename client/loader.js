import * as main from './main.js';
//I got this code from class assignments. In particular https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/client/client.html
const handleResponse = async (response) => {

    const content = document.querySelector('#content');

    //Based on the status code, display something
    switch (response.status) {
        case 200: //success
            content.innerHTML = `<b>Success</b>`;
            break;
        case 201: //created
            content.innerHTML = '<b>Created</b>';
            break;
        case 204: //updated (no response back from server)
            content.innerHTML = '<b>Updated (No Content)</b>';
            return;
        case 400: //bad request
            content.innerHTML = `<b>Bad Request</b>`;
            break;
        default: //any other status code
            content.innerHTML = `Error code not implemented by client.`;
            break;
    }

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
    const nameField = nameForm.querySelector('#nameField');
    const ageField = nameForm.querySelector('#ageField');
    const colorField = nameForm.querySelector('#colorField');

    //Build a data string in the FORM-URLENCODED format.
    const formData = `name=${nameField.value}&age=${ageField.value}&color=${colorField.value}`;

    //Make a fetch request and await a response. Set the method to
    //the one provided by the form (POST). Set the headers. Content-Type
    //is the type of data we are sending. Accept is the data we would like
    //in response. Then add our FORM-URLENCODED string as the body of the request.
    let response = await fetch('/addUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: formData,
    });

    //Once we have a response, handle it.
    handleResponse(response);
};

//Init function is called when window.onload runs. It hooks up the "Add Player" button t the functions that send the request.
const init = () => {
    const playerForm = document.querySelector('#playerForm');

    const addUser = (e) => {
        e.preventDefault();
        sendPost(playerForm);
        return false;
    }

    //Call addUser when the submit event fires on the form.
    playerForm.addEventListener('submit', addUser);
};

//When the window loads, run init.
window.onload = init;
window.onload = main.init;
