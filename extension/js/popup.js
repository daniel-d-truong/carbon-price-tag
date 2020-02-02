// Note that it's very hard to debug this since it is a popup. 
document.addEventListener("DOMContentLoaded", () => {

    // username
    const username_form = document.querySelector("#username-form");
    username_form.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.querySelector("#username").value;
        console.log(username);
        // call backend to retrieve info associated with username and update carbon spending
    })

    // address
    const addresses = document.querySelectorAll("#address-form input");
    addresses.forEach(function(item, index) {
        item.addEventListener("keyup", (event) => {
            if (event.key == "Enter") {
                const finalAddress = addresses[0].value + ", " + addresses[1].value;
                console.log(finalAddress);
            }
        });
    });

    // budget
    const budget_form = document.querySelector("#budget-form");
    budget_form.addEventListener("submit", (event) => {
        event.preventDefault();
        const budget = document.querySelector("#budget").value;
        console.log(budget);
    });
    
});