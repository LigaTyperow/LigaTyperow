import {
    getData,
    createDOMElement
} from "../script/apiRequest.js";


document.addEventListener("DOMContentLoaded", () => {

    getData().then(resp => {
        document.getElementById('matchday').innerText = resp.filters.dateFrom;
        const fullScoreboard = resp.matches;
        fullScoreboard.forEach(match => {
            console.log(`${match.homeTeam.name} VS ${match.awayTeam.name}`);
        });

    })
})