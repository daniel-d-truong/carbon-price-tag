// Note that it's very hard to debug this since it is a popup. 
document.addEventListener("DOMContentLoaded", () => {
    const updateEl = document.querySelector("#update");
    updateEl.addEventListener("click", () => {
        const address = document.querySelector("#address").value;
        const city = document.querySelector("#city").value;
        const state = document.querySelector("#state").value;
        const zip = document.querySelector("#zip").value;
        const finalAddress = address + ", " + city + ", " + state + ", " + zip;
        console.log(finalAddress);
    });
});
