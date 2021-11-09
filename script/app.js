import {
    getData
} from "../script/apiRequest.js";
import {
    createDOMElement,
    mapListToDOMElements
} from "../script/DOMActions.js"

let viewElems = {};
let leagueNameButtons = {};
let leagueName="";
document.addEventListener("DOMContentLoaded", () => {
  

    connectDOMElements();

    Object.keys(leagueNameButtons).forEach(leagueName => {
        leagueNameButtons[leagueName].addEventListener("click", setCurrentNameFilter);
    })

    
})

const connectDOMElements = () => {
    const listOfIds = Array.from(document.querySelectorAll('[id]')).map(elem => elem.id);
    const listOfLeagueNames = Array.from(document.querySelectorAll('[data-league-id]')).map(elem => elem.dataset.leagueId);

    viewElems = mapListToDOMElements(listOfIds, 'id');
    leagueNameButtons = mapListToDOMElements(listOfLeagueNames, 'data-league-id');
}

const fetchAndDisplayShows = ()=>{
    viewElems.finishedMatchesList.innerHTML="";
    viewElems.UpcomingMatchesList.innerHTML="";
    getData(leagueName).then(resp => {
        //document.getElementById('matchday').innerText = resp.filters.dateFrom;
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
                const singleMatch = createDOMElement('li','list-group-item', `${match.awayTeam.name} VS ${match.homeTeam.name}`);
                UpcomingMatchesList.appendChild(listOfUpcomingMatches);
                listOfUpcomingMatches.appendChild(singleMatch);
            }
        });

        // const fullScoreboard = resp.matches;
        // fullScoreboard.forEach(match => {
        //     console.log(`${match.homeTeam.name} VS ${match.awayTeam.name}`);
        // });

    })
}

const setCurrentNameFilter = () => {
    leagueName = event.target.dataset.leagueId;
    fetchAndDisplayShows();
}