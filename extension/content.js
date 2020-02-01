const url = window.location.href;
// Send the URL to the backend and load the content into the page

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