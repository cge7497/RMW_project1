// Handles the response from the POST request sent to the server to update the player with the item they received.
// I got this code from class assignments. In particular https://github.com/IGM-RichMedia-at-RIT/body-parse-example-done/blob/master/client/client.html
const handleResponse = async (response) => {

    let obj;
    switch (response.status) {
        case 200: // Player created with those items... Right now, this is not allowed by the server.
            obj = await response.json();
            break;
        case 204: // Existing player has been updated with those items.
            break;
        default: //any other status code
            console.error(obj);
            break;
    }
    return obj;
};

// sends the player data to the server as a POST request.
const updatePlayer = async (name, itemId) => {
    //Build a data string in the FORM-URLENCODED format.
    const formData = `name=${name}&item=${itemId}`;

    let response = await fetch('/updateItems', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: formData,
    });
    handleResponse(response);
};

// sends the player data to the server as a POST request.
const sendMovement = async (movement) => {
    //Build a data string in the FORM-URLENCODED format.
    const formData = `movement=${JSON.stringify(movement)}`;

    let response = await fetch('/addMovement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: formData,
    });

    //Once we have a response, handle it.
    let obj = await response.json();

    switch (response.status) {
        case 200:
            obj = await response.json();
            break;
        case 204:
            break;
        default: //any other status code
            console.error(obj);
            break;
    }
    return obj;
};

export {
    updatePlayer, sendMovement
  }