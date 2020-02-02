// Set functions
const cartCarbonFootprint = () => {
    const allCartEl = document.querySelectorAll(".sc-product-title.a-size-medium");
    const quantityElList = document.querySelectorAll(".a-icon.a-icon-dropdown")
    const idObj = { };
    for (let i = 0; i < allCartEl.length; i++) {
        // gets the ID of the amazon item
        const item = allCartEl[i];
        let itemUrl = item.parentElement.href;
        let id = null;
        if (itemUrl.includes("/gp/product/")) {
            id = itemUrl.substring(34, 44);
        } 
        // gets the element of the quantity dropdown
        const quantityEl = quantityElList[i].parentElement;
        let quantity = quantityEl.innerText;
        // possibly deal with some logic when the quantity is not a common one


        // add event listener to quantityEl when the value gets changed
        quantityEl.addEventListener("change", (event) => {
            console.log("changed");
        });
        if (id) {
            idObj[id] = quantity
        }
    }
    console.log(idObj);
}

const convertToPounds = (ounces) => {
    return ounces*(0.0625);
}

const grabWeightPerQuan = (term) => {
    let i = upperProductName.indexOf(term) - 2;
    let amount = "";

    while (upperProductName.charAt(i) !== ' ') {
        amount = upperProductName[i] + amount;
        i--;
    }
    weight = convertToPounds(Number(amount));
}

// logic for doing the cart
const url = window.location.href;
if (url.includes("cart")) {
    cartCarbonFootprint();
} 

// Gets the Item Weight, Shipping Weight, and asin
let a = document.querySelector("#detail-bullets");
let feature_list = a.getElementsByTagName("table")[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('div')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')
let item_weight = 0;
let ship_weight = 0;
let asin = null;
let weightFound = false;
for (const feature of feature_list) {
    let feature_arr = feature.innerText.split(': ');
    if (feature_arr[0] === "Item Weight") {
        item_weight = Number(feature_arr[1]);
        weightFound = true;
    }
    if (feature_arr[0] === "Shipping Weight") {
        ship_weight = Number(feature_arr[1]);
        weightFound = true;
    }
    if (feature_arr[0] === "ASIN") {
        asin = feature_arr[1]
    }
}
let weight = item_weight + ship_weight;
console.log([item_weight, ship_weight, asin]);

const port = chrome.runtime.connect({
    name: 'amazon-port'
});

// Gets the name of the product
const productTitleEl = document.querySelector("#productTitle");
const productName = productTitleEl.innerText.split(" ")[0];

// Gets the ingredients of the product
const importantInfoEl = document.querySelector("#important-information").querySelectorAll(".content");
let ingredients = [];
for (const infoEl of importantInfoEl){
    if (infoEl.getElementsByTagName("span")[0].innerText.toUpperCase() == "INGREDIENTS") {
        let ingredientsString = infoEl.innerText.replace("Ingredients\n", "");
        ingredientsString = ingredientsString.split("*").join("").split("\n").join("");
        ingredients = ingredientsString.split(", ").join(" ").split(" ");
        console.log(ingredients);
    }
}

const upperProductName = productTitleEl.innerText.toUpperCase();
// Gets the weight of the item per one quantity when weight can't be found
if (!weightFound) {
    console.log(upperProductName);
    if (upperProductName.includes("OUNCE")) {
        grabWeightPerQuan("OUNCE");
    } else if (upperProductName.includes("OZ")) {
        grabWeightPerQuan("OZ");
    }
}

console.log("Weight: " + weight);

// Adds the new element into the Amazon page
const el = document.querySelector("#priceblock_ourprice_row");
const carbonRow = document.createElement("tr");
const carbonCell = document.createElement("td");
carbonCell.setAttribute("colspan", 2);
const carbonTable = document.createElement("table");
const carbonData1 = document.createElement("td");
const carbonData2 = document.createElement("td");

carbonTable.setAttribute("style", "\
    display: block;\
    width: 90%;\
    margin-top: 1em;\
    padding: 1em;\
    font-family: Affogato, sans-serif;\
    font-size: 14px;\
    font-weight: 500;\
    border: 1px solid #53aa56;\
    border-radius: 5px;");
carbonData1.setAttribute("style", "color: #555;");
carbonData2.setAttribute("style", "color: #53aa56;");

carbonData1.innerHTML = "Carbon price:";
const carbonCost = 1.23;
const carbonCO2 = 60;
carbonData2.innerHTML = "est. $" + carbonCost + "  (equivalent to " + carbonCO2 + " kg of CO2)";

carbonRow.appendChild(carbonCell);
carbonCell.appendChild(carbonTable);
carbonTable.appendChild(carbonData1);
carbonTable.appendChild(carbonData2);
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
            'name': productName, 
            'ingredients': ingredients,
            'weight': item_weight + ship_weight,
            'carbon_location': message.address 
        })
    }).then(response => {
        return response.json();
    }).then((json) => {
        carbonData2.innerHTML = '$' + json['total_carbon_cost']
    });
});
