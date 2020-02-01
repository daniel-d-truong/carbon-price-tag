const url = window.location.href;
// Send the URL to the backend and load the content into the page

// grab items here
setTimeout(1000);
// let aaa, cheese;

// aaa = document.querySelector("#productTitle");
// cheese = aaa.textContent.trim();
// console.log(cheese);
// document.addEventListener("DOMContextLoaded", (event) => {
//     aaa = document.querySelector("#productTitle");
//     console.log("poop");
//     cheese = aaa.textContent.trim();
//     console.log(cheese);
// });

let a = document.querySelector("#detail-bullets");

let feature_list = a.getElementsByTagName("table")[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('div')[0].getElementsByTagName('ul')[0].getElementsByTagName('li')
let item_weight = null;
let ship_weight = null;
let asin = null;
for (const feature of feature_list) {
    let feature_arr = feature.innerText.split(': ');
    if (feature_arr[0] === "Item Weight") {
        item_weight = feature_arr[1]
    }
    if (feature_arr[0] === "Shipping Weight") {
        ship_weight = feature_arr[1]
    }
    if (feature_arr[0] === "ASIN") {
        asin = feature_arr[1]
    }

}

console.log([item_weight, ship_weight, asin]);

//
// let bbb = document.querySelector()

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