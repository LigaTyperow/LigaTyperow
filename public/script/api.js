import {
    getDataForShedule,
    getDataForTable
} from "./apiRequest.js";
import {
    createDOMElement,
    mapListToDOMElements
} from "./DOMActions.js";

// const personalToken = "06900aadf8064cdab4775b8b1c19db88";
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
        scoreBoardHeader.style.display = "block"
        scoreBoardHeaderFin.style.display = "block"
        scoreBoardHeaderSche.style.display = "block"

        fullSeasonMatches.forEach(match => {
            const dateString = match.utcDate;
            const dayOfMatch = dateString.replace(/T|Z/g, ' ').slice(0,16);

            const awayTeamScore = match.score.fullTime.awayTeam
            const homeTeamScore = match.score.fullTime.homeTeam
            const awayTeamName = match.awayTeam.name
            const homeTeamName = match.homeTeam.name
           
            const span3 = createDOMElement('span', 'matchDates', `${dayOfMatch}`);
            const span2 = createDOMElement('span', 'teamNames', `Wynik ${homeTeamScore}:${awayTeamScore}`);
            const span1 = createDOMElement('span', null, `${homeTeamName} : ${awayTeamName}`);

            if (match.status === "FINISHED") {
                const singleMatch = createDOMElement('li', 'list-group-item list-group-item-action list-group-item-dark');
                singleMatch.appendChild(span3)
                singleMatch.appendChild(span1)
                singleMatch.appendChild(span2)
                viewElems.finishedMatchesList.appendChild(listOfFinishedMatches);
                listOfFinishedMatches.appendChild(singleMatch);
            }

            if (match.status === "SCHEDULED") {
                const singleMatch = createDOMElement('li', 'list-group-item list-group-item-action list-group-item-dark');
                singleMatch.appendChild(span3)
                singleMatch.appendChild(span1)
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
                const result = createDOMElement('td', "", `${row.goalsFor}:${row.goalsAgainst}`);

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
                tr.appendChild(result);
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
        document.getElementById('leagueName').innerText = "Bundesliga";
    } else if (leagueName === "SA") {
        document.getElementById('leagueName').innerText = "Serie A";
    } else if (leagueName === "PD") {
        document.getElementById('leagueName').innerText = "La Liga";
    } else {
        document.getElementById('leagueName').innerText = ""
    }
}
