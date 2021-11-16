//Kod API sformatowany do klasy w razie czego

// class ApiController {

//     constructor() {
//         this.personalToken = "06900aadf8064cdab4775b8b1c19db88";
//         this.viewElems = {}; //elementy DOM. Kluczem jest id elementu, a zawartoscia faktyczny element 
//         this.leagueNameButtons = {}; // Przyciski do zmiany ligi
//         this.leagueName = ""; //Aktualnie wybrana liga
//     }

//     initialize = () => {
        
//         this.connectDOMElements();
//         Object.keys(this.leagueNameButtons).forEach(leagueName => {
//             this.leagueNameButtons[leagueName].addEventListener("click", this.setCurrentNameFilter);
//         })
//     }

//     connectDOMElements = () => {
//         const listOfIds = Array.from(document.querySelectorAll('[id]')).map(elem => elem.id); //pobiera wszystkie elementy posiadajace 'id', wyciaga te id i tworzy z tego tablice idków
//         const listOfLeagueNames = Array.from(document.querySelectorAll('[data-league-id]')).map(elem => elem.dataset.leagueId); //Jak u góry, z tym że szuka po datasecie leagueId

//         this.viewElems = mapListToDOMElements(listOfIds, 'id');
//         leagueNameButtons = mapListToDOMElements(listOfLeagueNames, 'data-league-id');
//     }

//     fetchAndDisplayData = () => {
//         this.viewElems.finishedMatchesList.innerHTML = "";
//         this.viewElems.UpcomingMatchesList.innerHTML = "";
//         const tableBody = document.querySelector('tbody')
//         tableBody.innerHTML = ""

//         getDataForShedule(leagueName).then(resp => {
//             this.switchLeagueName();
//             const fullSeasonMatches = resp.matches;
//             const listOfFinishedMatches = this.createDOMElement('ul', 'list-group');
//             const listOfUpcomingMatches = this.createDOMElement('ul', 'list-group');

//             fullSeasonMatches.forEach(match => {
//                 const dayOfMatch = match.utcDate.slice(0, 10);
//                 if (match.status === "FINISHED") {
//                     const singleMatch = this.createDOMElement('li', 'list-group-item list-group-item-action list-group-item-dark', `${dayOfMatch} ( ${match.score.fullTime.awayTeam}:${match.score.fullTime.homeTeam} ) | ${match.awayTeam.name} VS ${match.homeTeam.name} `);
//                     this.viewElems.finishedMatchesList.appendChild(listOfFinishedMatches);
//                     listOfFinishedMatches.appendChild(singleMatch);
//                 }

//                 if (match.status === "SCHEDULED") {
//                     const singleMatch = this.createDOMElement('li', 'list-group-item list-group-item-action list-group-item-dark', `${dayOfMatch} | ${match.awayTeam.name} VS ${match.homeTeam.name} `);
//                     this.viewElems.UpcomingMatchesList.appendChild(listOfUpcomingMatches);
//                     listOfUpcomingMatches.appendChild(singleMatch);
//                 }

//             });

//             getDataForTable(leagueName).then(resp => {
//                 const standingsTable = resp.standings[0].table;
//                 console.log(standingsTable);
//                 if (this.viewElems.leagueTable.style.display = "none") {
//                     this.viewElems.leagueTable.style.display = "initial"
//                 } else {
//                     this.viewElems.leagueTable.style.display = "none"
//                 }

//                 standingsTable.forEach(row => {
//                     const tr = createDOMElement('tr');
//                     const th = createDOMElement('th', "", row.position);
//                     th.scope = "row";
//                     const teamCrestImg = createDOMElement('img', "teamCrest", null, row.team.crestUrl);
//                     const teamCrest = createDOMElement('td', "teamCrest");
//                     const teamName = createDOMElement('td', "", row.team.name);
//                     const matchesPlayed = createDOMElement('td', "", row.playedGames);
//                     const pointEarned = createDOMElement('td', "", row.points);
//                     const wins = createDOMElement('td', "", `${row.won}`);
//                     const draws = createDOMElement('td', "", `${row.draw}`);
//                     const loses = createDOMElement('td', "", `${row.lost}`);

//                     teamCrest.appendChild(teamCrestImg);
//                     tableBody.appendChild(tr);

//                     tr.appendChild(th);
//                     tr.appendChild(teamCrest);
//                     tr.appendChild(teamName);
//                     tr.appendChild(matchesPlayed);
//                     tr.appendChild(pointEarned);
//                     tr.appendChild(wins);
//                     tr.appendChild(draws);
//                     tr.appendChild(loses);
//                 })
//             })
//         })

//     }

//     setCurrentNameFilter = () => {
//         this.leagueName = event.target.dataset.leagueId;
//         this.fetchAndDisplayData();
//     }

//     switchLeagueName = () => {
//         if (leagueName === "PL") {
//             document.getElementById('leagueName').innerText = "Premier League";
//         } else if (leagueName === "BL1") {
//             document.getElementById('leagueName').innerText = "Bundesligi";
//         } else if (leagueName === "SA") {
//             document.getElementById('leagueName').innerText = "Serie A";
//         } else if (leagueName === "PD") {
//             document.getElementById('leagueName').innerText = "La Ligi";
//         } else {
//             document.getElementById('leagueName').innerText = ""
//         }
//     }

//     _getDOMElem = (attribute, value) => {
//         return document.querySelector(`[${attribute} = "${value}"]`);
//     }

//     createDOMElement = (tagName, className, innerText, src) => {
//         const tag = document.createElement(tagName);
//         tag.classList = className;

//         if (innerText) {
//             tag.innerText = innerText;
//         }

//         if (src) {
//             tag.src = src;
//         }
//         return tag;
//     }

//     mapListToDOMElements = (listOfValues, attribute) => { //
//         const _viewElems = {};

//         for (const value of listOfValues) {
//             _viewElems[value] = this._getDOMElem(attribute, value);
//         }

//         return _viewElems;
//     }

//     // personalToken = "06900aadf8064cdab4775b8b1c19db88" 
//     // const url = "https://api.football-data.org/v2/matches"
//     // const url = "https://api.football-data.org/v2/competitions/PL/matches"
//     // const url = "http://api.football-data.org/v2/teams/18"
//     // const url = "http://api.football-data.org/v2/competitions/2021/standings"


//     getDataForShedule = leagueName => {
//         return fetch(`https://api.football-data.org/v2/competitions/${leagueName}/matches`, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-Auth-Token': this.personalToken
//                 }
//             }).then(resp => resp.json())
//             .catch((error) => {
//                 alert("Wystąpił problem z danymi")
//                 console.error('Error:', error);
//             });
//     }

//     getDataForTable = leagueName => {
//         return fetch(`http://api.football-data.org/v2/competitions/${leagueName}/standings`, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-Auth-Token': this.personalToken
//                 }
//             }).then(resp => resp.json())
//             .catch((error) => {
//                 alert("Wystąpił problem z danymi")
//                 console.error('Error:', error);
//             });
//     }
// }

// // document.addEventListener("DOMContentLoaded", new ApiController());