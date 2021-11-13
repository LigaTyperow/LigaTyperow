import {
    getDataForShedule,
    getDataForTable
} from "../script/apiRequest.js";
import {
    createDOMElement,
    mapListToDOMElements
} from "../script/DOMActions.js"

const personalToken = "06900aadf8064cdab4775b8b1c19db88";
let viewElems = {}; //elementy DOM. Kluczem jest id elementu, a zawartoscia faktyczny element 
let leagueNameButtons = {}; // Przyciski do zmiany ligi
let leagueName = ""; //Aktualnie wybrana liga

document.addEventListener("DOMContentLoaded", () => {
    connectDOMElements();
    Object.keys(leagueNameButtons).forEach(leagueName => {
        leagueNameButtons[leagueName].addEventListener("click", setCurrentNameFilter);
    })
})

const connectDOMElements = () => {
    const listOfIds = Array.from(document.querySelectorAll('[id]')).map(elem => elem.id); //pobiera wszystkie elementy posiadajace 'id', wyciaga te id i tworzy z tego tablice idków
    const listOfLeagueNames = Array.from(document.querySelectorAll('[data-league-id]')).map(elem => elem.dataset.leagueId); //Jak u góry, z tym że szuka po datasecie leagueId

    viewElems = mapListToDOMElements(listOfIds, 'id');
    leagueNameButtons = mapListToDOMElements(listOfLeagueNames, 'data-league-id');
}

const fetchAndDisplayData = () => {
    viewElems.finishedMatchesList.innerHTML = "";
    viewElems.UpcomingMatchesList.innerHTML = "";
    const tableBody = document.querySelector('tbody')
    tableBody.innerHTML = ""

    getDataForShedule(leagueName).then(resp => {
        switchLeagueName();
        const fullSeasonMatches = resp.matches;
        const listOfFinishedMatches = createDOMElement('ul', 'list-group');
        const listOfUpcomingMatches = createDOMElement('ul', 'list-group');

        fullSeasonMatches.forEach(match => {
            const dayOfMatch = match.utcDate.slice(0, 10);
            if (match.status === "FINISHED") {
                const singleMatch = createDOMElement('li', 'list-group-item list-group-item-action list-group-item-dark', `${dayOfMatch} ( ${match.score.fullTime.awayTeam}:${match.score.fullTime.homeTeam} ) | ${match.awayTeam.name} VS ${match.homeTeam.name} `);
                viewElems.finishedMatchesList.appendChild(listOfFinishedMatches);
                listOfFinishedMatches.appendChild(singleMatch);
            }

            if (match.status === "SCHEDULED") {
                const singleMatch = createDOMElement('li', 'list-group-item list-group-item-action list-group-item-dark', `${dayOfMatch} | ${match.awayTeam.name} VS ${match.homeTeam.name} `);
                viewElems.UpcomingMatchesList.appendChild(listOfUpcomingMatches);
                listOfUpcomingMatches.appendChild(singleMatch);
            }

        });

        getDataForTable(leagueName).then(resp => {
            const standingsTable = resp.standings[0].table;
            console.log(standingsTable);
            if (viewElems.leagueTable.style.display = "none") {
                viewElems.leagueTable.style.display = "initial"
            } else {
                viewElems.leagueTable.style.display = "none"
            }

            standingsTable.forEach(row => {
                const tr = createDOMElement('tr');
                const th = createDOMElement('th', "", row.position);
                th.scope = "row";
                const teamCrestImg = createDOMElement('img', "teamCrest", null, row.team.crestUrl);
                const teamCrest = createDOMElement('td', "teamCrest");
                const teamName = createDOMElement('td', "", row.team.name);
                const matchesPlayed = createDOMElement('td', "", row.playedGames);
                const pointEarned = createDOMElement('td', "", row.points);
                const wins = createDOMElement('td', "", `${row.won}`);
                const draws = createDOMElement('td', "", `${row.draw}`);
                const loses = createDOMElement('td', "", `${row.lost}`);

                teamCrest.appendChild(teamCrestImg);
                tableBody.appendChild(tr);

                tr.appendChild(th);
                tr.appendChild(teamCrest);
                tr.appendChild(teamName);
                tr.appendChild(matchesPlayed);
                tr.appendChild(pointEarned);
                tr.appendChild(wins);
                tr.appendChild(draws);
                tr.appendChild(loses);
            })
        })
    })

}

const setCurrentNameFilter = () => {
    leagueName = event.target.dataset.leagueId;
    fetchAndDisplayData();
}

const switchLeagueName = () => {
    if (leagueName === "PL") {
        document.getElementById('leagueName').innerText = "Premier League";
    } else if (leagueName === "BL1") {
        document.getElementById('leagueName').innerText = "Bundesligi";
    } else if (leagueName === "SA") {
        document.getElementById('leagueName').innerText = "Serie A";
    } else if (leagueName === "PD") {
        document.getElementById('leagueName').innerText = "La Ligi";
    } else {
        document.getElementById('leagueName').innerText = ""
    }
}