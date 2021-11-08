import {
    getData
} from "../script/apiRequest.js";
import {
    createDOMElement
} from "../script/DOMActions.js"


document.addEventListener("DOMContentLoaded", () => {

    getData().then(resp => {
        const fullSeasonMatches = resp.matches;
        console.log(fullSeasonMatches);
        const listOfFinishedMatches = createDOMElement('ul', 'list-group');
        const listOfUpcomingMatches = createDOMElement('ul', 'list-group');
        fullSeasonMatches.forEach(match => {
            if (match.status === "FINISHED") {
                const finishedMatchesList = document.getElementById('finishedMatchesList');
                const singleMatch = createDOMElement('li','list-group-item', `${match.awayTeam.name} VS ${match.homeTeam.name} (${match.score.fullTime.awayTeam}:${match.score.fullTime.homeTeam})`);
                finishedMatchesList.appendChild(listOfFinishedMatches);
                listOfFinishedMatches.appendChild(singleMatch);
            }
            
            if (match.status === "SCHEDULED") {
                const UpcomingMatchesList = document.getElementById('UpcomingMatchesList');
                const singleMatch = createDOMElement('li','list-group-item', `${match.awayTeam.name} VS ${match.homeTeam.name} (${match.score.fullTime.awayTeam}:${match.score.fullTime.homeTeam})`);
                UpcomingMatchesList.appendChild(listOfUpcomingMatches);
                listOfUpcomingMatches.appendChild(singleMatch);
            }
        });

        // document.getElementById('matchday').innerText = resp.filters.dateFrom;
        // const fullScoreboard = resp.matches;
        // fullScoreboard.forEach(match => {
        //     console.log(`${match.homeTeam.name} VS ${match.awayTeam.name}`);
        // });

    })
})