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

        let leagueName = ""
        if (name === "PL") leagueName = "Premier League"
        else if (name === "BL1") leagueName = "Bundesliga"
        else if (name === "SA") leagueName = "Serie A"
        else if (name === "PD") leagueName = "Liga Santander"
        else leagueName = ""      
        
        await axios.post('http://localhost:80/api/matches', {
            finishedMatches,
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
        currentMatchday = await axios.get(`http://api.football-data.org/v2/competitions/PL`, {
            headers: headers
        }).then(resp => resp.data.currentSeason.currentMatchday)

    } catch (error) {
        console.log(error);
    }

    let dbInfo = await Match.findOne({ leagueName: 'Premier League', gameweek: currentMatchday });
    
    //Jeśli kolejka obojętnie z jakiej ligi jest inna to mamy nieaktualne dane usuwamy wszystkie mecze i wgrywamy nową
    if (dbInfo.gameweek != currentMatchday) {
        console.log(`USUNIETO`);
        await Match.deleteMany();

        const leagueNames = ["PL", "BL1", "SA", "PD"];

        leagueNames.forEach(name => {
            getData(name)
        })
        console.log(`DODANO DO BAZY`);
    } else {
        //jeśli jest taka sama to nie robimy nic
        console.log(`JUŻ ISTNIEJE`);
    }
}

ifDataExist();

// POST do bazy danych ostatniej i przyszłej kolejki
// leagueNames.forEach(name => {
//     getData(name)
// })