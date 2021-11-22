//Pobieranie danych GET z API i POST jako obiekt do kontrolera

const axios = require('axios');
const Match = require('../db/models/match.js');

// W razie czego
const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
}

const leagueNames = ["PL", "BL1", "SA", "PD"] // skróty nazw lig to pobierania danych
// const urlToGetGameweek = `http://api.football-data.org/v2/competitions/${name}` // pod currentSeason.currentMatchday znajduje się aktualnie grana/ostatnia kolejka, 
// czyli następna kolejkę pobieramy po prostu zwiekszając aktualną o jeden

async function getData(name) {
    try {
        //pobieramy cyfrę aktualnej kolejki ligi
        const currentMatchday = await axios.get(`http://api.football-data.org/v2/competitions/${name}`, {
            headers: headers
        }).then(resp => resp.data.currentSeason.currentMatchday)

        //pobieramy mecze z ostatniej kolejki
        const finishedMatches = await axios.get(`https://api.football-data.org/v2/competitions/${name}/matches?matchday=${currentMatchday}`, {
            headers: headers
        }).then(resp => resp.data.matches)

        const upcomingMatchday = parseInt(currentMatchday) + 1;

        //pobieramy mecze z następnej kolejki
        const upcomingMatches = await axios.get(`https://api.football-data.org/v2/competitions/${name}/matches?matchday=${upcomingMatchday}`, {
            headers: headers
        }).then(resp => resp.data.matches)

        let leagueName=""
        if(name ==="PL") leagueName = "Premier League"
        else if(name ==="BL1")leagueName = "Bundesliga"
        else if(name ==="SA")leagueName = "Serie A"
        else if(name ==="PD")leagueName = "Liga Santander"
        else leagueName=""

        //pobieranie w petli currentMatchday kazdej ligi
        // sprawdzamy czy currentMatchday jest taki sam jak w request
        // if jest taki sam to nie robimy requesta
        // else (jeslie nie jest taki sam) to robimy requesta i replace i post

        //wczytujemy dane z bd
        // const bd_nazwa = await Match.find({ leagueName: leagueName, gameweek: currentMatchday });
            // const bd_nazwa = await Match.find(  )
            // console.log(bd_nazwa);

        //warunek do ogarniecia        
        if (true) {
            await axios.post('http://localhost:80/api/matches', {            
                finishedMatches,
                leagueName,
                upcomingMatches
            })            
        }
    } catch (error) {
        console.error(error);
    }
}

leagueNames.forEach(name => {
    getData(name)
})
// leagueNames.forEach(name => {
//     axios.get(`https://api.football-data.org/v2/competitions/${name}/matches?matchday={}`, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
//             }
//         })
//         .then(function (resp) {
//             const matches = resp.data.matches; //mecze w danej kolejce
//             const leagueName = resp.data.competition.name; //nazwa ligi

//             axios.post('http://localhost:80/api/matches', {
//                 matches,
//                 leagueName
//             })
//         })
//         .catch(function (error) {
//             console.log(error);
//         })
//         .then(function () {
//             // wykona się zawsze, nawet jak będzie błąd
//         });

// });

// konkretna kolejka

// axios.get('https://api.football-data.org/v2/competitions/PL/matches?matchday=11', {
//         headers: {
//             'Content-Type': 'application/json',
//             'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
//         }
//     })
//     .then(function (resp) {        
//         const matches = resp.data.matches; //mecze w danej kolejce
//         const leagueName = resp.data.competition.name; //nazwa ligi

//         axios.post('http://localhost:80/api/matches', {matches, leagueName})
//     })
//     .catch(function (error) {
//         console.log(error);
//     })
//     .then(function () {
//         // wykona się zawsze, nawet jak będzie błąd
//     });