// Set functions
const idObj = {}
let productName;
let ingredients = [];
let item_weight = 0;
let ship_weight = 0.5;
let asin = null;
const carbonData1 = document.createElement("td");
const carbonData2 = document.createElement("td");
let upperProductName;

const price = new Intl.NumberFormat('en-US',
                            { style: 'currency', currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                            });
const kgFormat = new Intl.NumberFormat('en-US',
                            { maximumFractionDigits: 2 });

const cartCarbonFootprint = () => {
    const allCartEl = document.querySelectorAll(".sc-product-title.a-size-medium");
    const quantityElList = document.querySelectorAll(".a-icon.a-icon-dropdown")
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
        if (!Number(quantity)) {
            quantity = quantity.substring(0, quantity.indexOf(" "));
        }

        quantity = Number(quantity);

        // add event listener to quantityEl when the value gets changed
        quantityEl.addEventListener("change", (event) => {
            console.log("changed");
        });
        if (id) {
            idObj[id] = quantity;
        }
    }
    console.log(idObj);
};

const convertToPounds = (ounces) => {
    return ounces*(0.0625);
};

const grabWeightPerQuan = (term) => {
    let i = upperProductName.indexOf(term) - 2;
    let amount = "";

    while (upperProductName.charAt(i) !== ' ') {
        amount = upperProductName[i] + amount;
        i--;
    }
    weight = convertToPounds(Number(amount));
};

const convertToKilo = (pounds) => {
    return 0.453592*pounds;
};

// makes fetch request to the backend
const makeCarbonFetch = async (address, id) => {
    fetch("http://127.0.0.1:5000/carbon-price/get-footprint", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            'id': id,
            'name': productName, 
            'ingredients': ingredients,
            'weight': item_weight + ship_weight,
            'carbon_location': address 
        })
    }).then(response => {
        return response.json();
    }).then((json) => {
        let cost = price.format(json['total_carbon_cost']);
        let kgOfCo2 = kgFormat.format(json['kg_of_co2']);
        carbonData2.innerHTML = "est. " + cost + "  (equivalent to " + kgOfCo2 + " kg of CO2)";
    }).catch((e) => {
        carbonData2.innerHTML = "No data found for this item.";
    })
}

// logic for doing the cart
const url = window.location.href;
let itemId;
if (url.includes("cart")) {
    cartCarbonFootprint();
} else if (url.includes("/dp/") || url.includes("/gp/")){
    if (url.includes("/dp/")) {
        itemId = url.split("/dp/")[1].substring(0, 10)
    } else if (url.includes("/gp/product/")) {
        itemId = url.split("/gp/product/")[1].substring(0, 10)
    }
        // Gets the name of the product
    const productTitleEl = document.querySelector("#productTitle");
    productName = productTitleEl.innerText;
        // Gets the Item Weight, Shipping Weight, and asin
    let a = document.querySelector("#detail-bullets");
    let feature_list = a.getElementsByTagName("table")[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('div')[0].getElementsByTagName('ul')[0].getElementsByTagName('li');
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

    // Gets the ingredients of the product
    const importantInfoEl = document.querySelector("#important-information").querySelectorAll(".content");
    for (const infoEl of importantInfoEl){
        if (infoEl.getElementsByTagName("span")[0].innerText.toUpperCase() == "INGREDIENTS") {
            let ingredientsString = infoEl.innerText.replace("Ingredients\n", "");
            ingredientsString = ingredientsString.split("*").join("").split("\n").join("");
            ingredients = ingredientsString.split(", ").join(" ").split(" ");
            console.log(ingredients);
        }
    }

    upperProductName = productTitleEl.innerText.toUpperCase();
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

    carbonTable.setAttribute("style", "\
        display: block;\
        width: 90%;\
        margin-top: 1em;\
        padding: 1em;\
        font-size: 14px;\
        font-weight: 500;\
        border: 1px solid #53aa56;\
        border-radius: 5px;");
    carbonData1.setAttribute("style", "color: #555;");
    carbonData2.setAttribute("style", "color: #53aa56;");

    carbonData1.innerHTML = "Carbon price:";
    const placeHolder = "___";
    carbonData2.innerHTML = "est. $" + placeHolder + "  (equivalent to " + placeHolder + " kg of CO2)";

    carbonRow.appendChild(carbonCell);
    carbonCell.appendChild(carbonTable);
    carbonTable.appendChild(carbonData1);
    carbonTable.appendChild(carbonData2);
    el.insertAdjacentElement('afterend', carbonRow);
    makeCarbonFetch("3607 Trousdale Pkwy, Los Angeles, CA 90089", itemId);
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.address) {
      // Makes a POST request which would send information to the backend and retreives the carbon pricing in response. This should be redone 
      // whenever the user updates their address.
      makeCarbonFetch(message.address, itemId);
    } else if (message.username && message.action === "buy") { // buys the cart
        fetch("http://127.0.0.1:5000/db/cart", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                'user_id': message.username,
                'item_map': idObj
            })
            // we need to make sure firebase can do stuff
        }).then((response) => { return response.json(); })
          .then((json) => {
            console.log(json.new_footprint);
            chrome.runtime.sendMessage({
                "spending": Math.floor(json.new_footprint*10)/10
            })
          });
    } else if (message.username && message.action === "update") { //updates the front end
        fetch("http://127.0.0.1:5000/db/user/" + message.username)
            .then((data) => {
                return data.json();
            }).then((json) => {
                chrome.runtime.sendMessage({
                    "spending": Math.floor(json.total_spending*10)/10
                })
            })
    }
});
