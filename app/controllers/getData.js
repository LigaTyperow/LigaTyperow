//Pobieranie danych GET z API i POST jako obiekt do kontrolera
const axios = require('axios');
const Match = require('../db/models/match.js');

const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
}

const leagueNames = ["PL", "BL1", "SA", "PD"] // skróty nazw lig to pobierania danych

async function getData(name) {
    try {
        //pobieramy cyfrę aktualnej kolejki ligi
        const currentMatchday = await axios.get(`https://api.football-data.org/v2/competitions/${name}`, {
            headers: headers
        }).then(resp => resp.data.currentSeason.currentMatchday)

        //pobieramy mecze z ostatniej kolejki
        const currentMatches = await axios.get(`https://api.football-data.org/v2/competitions/${name}/matches?matchday=${currentMatchday}`, {
            headers: headers
        }).then(resp => resp.data.matches)

        const upcomingMatchday = parseInt(currentMatchday) + 1;

        //pobieramy mecze z następnej kolejki
        const upcomingMatches = await axios.get(`https://api.football-data.org/v2/competitions/${name}/matches?matchday=${upcomingMatchday}`, {
            headers: headers
        }).then(resp => resp.data.matches)

        let leagueName = ""
        if (name === "PL") leagueName = "Premier League"
        else if (name === "BL1") leagueName = "Bundesliga"
        else if (name === "SA") leagueName = "Serie A"
        else if (name === "PD") leagueName = "Liga Santander"
        else leagueName = ""      
        
        await axios.post('http://localhost:80/api/matches', {
            currentMatches,
            leagueName,
            upcomingMatches
        })        
    } catch (error) {
        console.error(error);
    }
}

async function ifDataExist() {
    let currentMatchday = null;
    try {
        //pobieramy cyfrę aktualnej kolejki ligi
        currentMatchday = await axios.get(`https://api.football-data.org/v2/competitions/PL`, {
            headers: headers
        }).then(resp => resp.data.currentSeason.currentMatchday)

    } catch (error) {
        console.log(error);
    }

    //Pobieramy z API aktualną kolejkę PL
    const currentMatchesPL = await axios.get(`https://api.football-data.org/v2/competitions/PL/matches?matchday=${currentMatchday}`, {
        headers: headers
    }).then(resp => resp.data.matches)


    //Sprawdzamy czy WSZYSTKIE MECZE Z API W PL AKTUALNEJ KOLEJKI są ZAKOŃCZONE
    let resultQuery = currentMatchesPL.every(match => match.status === "FINISHED" || match.status === "SCHEDULED");


    //Jesli wszystkie mecze są zakończone, to usuwamy całą tabelę w BD oraz robimy requesta do API.
    //Jeśli zrobimy to gdy aktualną kolejką w API jest jeszcze kolejka poprzednia, 
    //to po prostu otrzymamy te same dane, jeśli nie to kolejkę następną od aktualnej oraz kolejną po niej
    if (resultQuery) {
        console.log(`Usunięto kolejkę`);
        await Match.deleteMany();

        leagueNames.forEach(name => {
            getData(name);
        })
        console.log(`DODANO DO BAZY`);
    } else {
        console.log(`Nie wszystkie mecze z kolejki zostały zakończone`);
    }
}

ifDataExist();

// POST do bazy danych ostatniej i przyszłej kolejki
// leagueNames.forEach(name => {
//     getData(name)
// })