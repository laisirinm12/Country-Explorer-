let allCountries = [];

async function loadCountries() {
    try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
        if (!res.ok) {
            throw new Error(`Failed to load countries: ${res.status}`);
        }

        const data = await res.json();
        allCountries = data.map(c => c.name.common).sort();
    }
    catch (error) {
        console.error(error);
        allCountries = [];
    }
}

loadCountries();

async function searchCountry() {

    const countryName = document.getElementById("countryInput").value;
    document.getElementById("result").innerHTML =
        "<p>🌍 Loading country information...</p>";
    const countryRes = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
    const countryData = await countryRes.json();

    const country = countryData[0];

    const flag = country.flags.png;
    const capital = country.capital[0];
    const population = country.population.toLocaleString();
    const region = country.region;
    const area = country.area.toLocaleString();
    const timezone = country.timezones.join(", ");
    const languages = Object.values(country.languages).join(", ");

    const currency = Object.values(country.currencies)[0].name;

    let bordersHTML = "None";

    if (country.borders) {

        const borderPromises = country.borders.map(code =>
            fetch(`https://restcountries.com/v3.1/alpha/${code}`).then(res => res.json())
        );

        const borderCountries = await Promise.all(borderPromises);

        bordersHTML = borderCountries.map(b =>
            `
<div class="border-card" onclick="searchCountryByName('${b[0].name.common}')">
    <img src="${b[0].flags.png}" class="border-flag">
    <p>${b[0].name.common}</p>
</div>
`
        ).join("");
    }

    const map = `https://maps.google.com/maps?q=${countryName}&output=embed`;

    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`);
    const wikiData = await wikiRes.json();

    const description = wikiData.extract;

    document.getElementById("result").innerHTML = `
        <h2 class="country-name">${country.name.common}</h2>

        <img src="${flag}">
        
        <div class="description">
    <b>Description:</b>
    <p>${description}</p>
</div>

        <div class="country-details">

            <p><b>Capital:</b> ${capital}</p>
            <p><b>Area:</b> ${area} km²</p>
            <p><b>Population:</b> ${population}</p>
            <p><b>Region:</b> ${region}</p>
            <p><b>Timezone:</b> ${timezone}</p>
            <p><b>Languages:</b> ${languages}</p>
            <p><b>Currency:</b> ${currency}</p>

        </div>
        
        <p class="neighbours-title" ><b>Neighbouring Countries:</b></p>
    <div class="borders-container">
    ${bordersHTML}
</div>

        <iframe width="100%" height="300" src="${map}"></iframe>
    `;
}

function searchCountryByName(name) {
    document.getElementById("countryInput").value = name;
    searchCountry();
}

function randomCountry() {

    const randomIndex = Math.floor(Math.random() * allCountries.length);

    const randomName = allCountries[randomIndex];

    document.getElementById("countryInput").value = randomName;

    searchCountry();
}

document.getElementById("countryInput")
    .addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchCountry();
        }
    });
document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("countryInput").addEventListener("input", function () {

        const value = this.value.toLowerCase();
        const suggestionsBox = document.getElementById("suggestions");

        suggestionsBox.innerHTML = "";

        if (value.length === 0 || allCountries.length === 0) return;

        const matches = allCountries.filter(c =>
            c.toLowerCase().startsWith(value)
        ).slice(0, 5);

        matches.forEach(country => {

            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.textContent = country;

            div.onclick = function () {
                document.getElementById("countryInput").value = country;
                suggestionsBox.innerHTML = "";
                searchCountry();
            };

            suggestionsBox.appendChild(div);

        });

    });

});