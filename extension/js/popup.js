// Note that it's very hard to debug this since it is a popup. 
document.addEventListener("DOMContentLoaded", () => {
    drawArc();

    // username
    const username_form = document.querySelector("#username-form");
    const username_input = username_form.querySelector("input");
    username_input.addEventListener("focus", (event) => {
        event.target.select();
    });
    username_form.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.querySelector("#username").value;
        const el = event.target.elements[0];
        el.blur();
        // call backend to retrieve info associated with username and update carbon spending
        broadcastObj({"username": username, "action": "update"});

    })

    // address
    const addresses = document.querySelectorAll("#address-form input");
    addresses.forEach(function(item, index) {
        item.addEventListener("focus", (event) => {
            event.target.select();
        })
        item.addEventListener("keyup", (event) => {
            if (event.key == "Enter") {
                const finalAddress = addresses[0].value + ", " + addresses[1].value;
                console.log(finalAddress);
                const el = event.target;
                el.blur();
                broadcastObj({"address": address});
            }
        });
    });

    // budget
    const budget_form = document.querySelector("#budget-form");
    const budget_input = budget_form.querySelector("input");
    budget_input.addEventListener("focus", (event) => {
        event.target.select();
    })
    budget_form.addEventListener("submit", (event) => {
        event.preventDefault();
        const budget = document.querySelector("#budget").value;
        console.log(budget);
        const el = event.target.elements[0];
        el.blur();
        drawArc();
    });

    // Buying foods event listener
    document.querySelector(".button").addEventListener("click", () => {
        const username = document.querySelector("#username").value;
        broadcastObj({"username": username, "action": "buy"});
    });

    // Listener to communicate front end data to backend
    chrome.runtime.onMessage.addListener((request) => {
        console.log(request.spending);
        document.querySelector("#carbonSpending").innerText = request.spending;
        drawArc();
    });

    broadcastObj({"username": "numberonetruong", "action": "update"});
});

function drawArc() {
    const carbonSpending = parseFloat(document.querySelector("#carbonSpending").innerHTML);
    const budget = parseFloat(document.querySelector("#budget").value);
    const pct = carbonSpending / budget;
    const arc = document.querySelector("#arc");
    const offsetMax = 1000;
    const offsetMin = 580;
    arc.style["stroke-dashoffset"] = Math.max(offsetMax - pct * (offsetMax - offsetMin),0);
    if (carbonSpending <= budget) {
        arc.style.stroke = "#25922F";
    } else {
        arc.style.stroke = "#C73E41";
    }
}

const broadcastObj = async (obj) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, obj);
    });
};