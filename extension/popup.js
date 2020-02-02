// Note that it's very hard to debug this since it is a popup. 
let _port; 
chrome.runtime.onConnect.addListener(function(port) {
    console.log("connected to: " + port);
    _port = port;
});

const broadcastAddress = (address) => {
    _port.postMessage({
        address: address
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const updateEl = document.querySelector("#update");
    updateEl.addEventListener("click", () => {
        const address = document.querySelector("#address").value;
        const city = document.querySelector("#city").value;
        const state = document.querySelector("#state").value;
        const zip = document.querySelector("#zip").value;
        const finalAddress = address + ", " + city + ", " + state + ", " + zip;
        console.log(finalAddress);
        broadcastAddress(finalAddress);
    });
});

const userButton = document.querySelector("#updateUser");
const userText = document.querySelector("#username");
updateUserTotal(userText.value);
userButton.addEventListener("click", () => {
    // updates the user carbon footprint spent
    console.log("eee");
    const newUser = userText.value;
    updateUserTotal(newUser);
});

const updateUserTotal = (username) => { 
    // calls the backend to update the amount of carbon footprint spent based on the user
    console.log(username);
};


