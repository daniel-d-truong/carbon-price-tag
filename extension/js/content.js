// Gets the Item Weight, Shipping Weight, and asin
let a = document.querySelector("#detail-bullets");
let feature_list = a.getElementsByTagName("table")[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('div')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')
let item_weight = 0;
let ship_weight = 0;
let asin = null;
for (const feature of feature_list) {
    let feature_arr = feature.innerText.split(': ');
    if (feature_arr[0] === "Item Weight") {
        item_weight = Number(feature_arr[1]);
    }
    if (feature_arr[0] === "Shipping Weight") {
        ship_weight = Number(feature_arr[1]);
    }
    if (feature_arr[0] === "ASIN") {
        asin = feature_arr[1]
    }
}
console.log([item_weight, ship_weight, asin]);

const port = chrome.runtime.connect({
    name: 'amazon-port'
});

// Gets the name of the product
const productTitleEl = document.querySelector("#productTitle");
const productName = productTitleEl.innerHTML.trim().split(" ")[0];

// Gets the ingredients of the product
const importantInfoEl = document.querySelector("#important-information").querySelectorAll(".content");
let ingredients = [];
for (const infoEl of importantInfoEl){
    if (infoEl.getElementsByTagName("span")[0].innerText.toUpperCase() == "INGREDIENTS") {
        let ingredientsString = infoEl.innerText.replace("Ingredients\n", "");
        ingredientsString = ingredientsString.split("*").join("").split("\n").join("");
        ingredients = ingredientsString.split(", ");
        console.log(ingredients);
    }
}


// Adds the new element into the Amazon page
const el = document.querySelector("#priceblock_ourprice_row");
const carbonRow = document.createElement("tr");
const carbonData1 = document.createElement("td");
const carbonData2 = document.createElement("td");

const carbonRowStyles = "padding: 1em;display: block;margin: 1em;width: 100%;border-radius: 5px;border: 1px solid #53aa56;";
const carbonData1Styles = "color: #555;";
const carbonData2Styles = "color: #53aa56;";

carbonRow.setAttribute("style", carbonRowStyles);
carbonData1.setAttribute("style", carbonData1Styles);
carbonData2.setAttribute("style", carbonData2Styles);

carbonData1.innerHTML = "Carbon price:";
carbonData2.innerHTML = "est. $1.23 (equivalent to 60 kg of CO2)";

carbonRow.appendChild(carbonData1);
carbonRow.appendChild(carbonData2);
el.insertAdjacentElement('afterend', carbonRow);

port.onMessage.addListener(function(message) {
    console.log(message);
    // Makes a POST request which would send information to the backend and retreives the carbon pricing in response. This should be redone 
    // whenever the user updates their address.
    fetch("http://127.0.0.1:5000/carbon-price/get-footprint", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            'name': productName, 'ingredients': ingredients,
            'weight': item_weight + ship_weight,
            'carbon_location': message.address 
        })
    }).then(response => {
        return response.json();
    }).then((json) => {
        carbonData2.innerHTML = '$' + json['total_carbon_cost']
    });
});
