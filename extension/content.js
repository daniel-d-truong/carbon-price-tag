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

const url = window.location.href;
// logic for doing the cart
if (url.includes("cart")) {
    cartCarbonFootprint();
} 

// Gets the Item Weight, Shipping Weight, and asin
let a = document.querySelector("#detail-bullets");
let feature_list = a.getElementsByTagName("table")[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('div')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')
let item_weight = 0;
let ship_weight = 0.5;
let asin = null;
let weightFound = false;
for (const feature of feature_list) {
    let feature_arr = feature.innerText.split(': ');
    // Not guaranteed to exist
    if (feature_arr[0] === "Item Weight") {
        item_weight = Number(feature_arr[1]);
        weightFound = true;
    }
    if (feature_arr[0] === "Shipping Weight") {
        ship_weight = Number(feature_arr[1]);
        weightFound = true;
    }
    // Guaranteed to always exist
    if (feature_arr[0] === "ASIN") {
        asin = feature_arr[1]
    }
}
let weight = item_weight + ship_weight;
console.log([item_weight, ship_weight, asin]);

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

// Makes a POST request which would send information to the backend and retreives the carbon pricing in response. This should be redone 
// whenever the user updates their address.


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

