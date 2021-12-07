//Pobieranie danych GET z API i POST jako obiekt do kontrolera
const axios = require('axios');
const Match = require('../db/models/match.js');
const Gameweek = require('../db/models/gameweek.js');

const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
}

// const leagueNames = ["PL", "BL1", "SA", "PD"] // skróty nazw lig to pobierania danych
const leagueObjects = [{
        leagueCode: "PL",
        currentMatchday: null
    },

    {
        leagueCode: "BL1",
        currentMatchday: null
    },

    {
        leagueCode: "SA",
        currentMatchday: null
    },

    {
        leagueCode: "PD",
        currentMatchday: null
    }
]
//Funkcja uruchamiająca po kolei funkcje asynchroniczne (wywołana na dole)


//Pobieramy aktualną kolejkę z bazy danych
async function getCurrentMatchday() {
    //pobieramy aktualną kolejkę danej ligi
    return await axios.get(`http://api.football-data.org/v2/competitions`, {
            headers: headers
        })
        .then(resp => {
            // index = resp.data.competitions.indexOf(leagueObj);
            leagueObjects.forEach(leagueObj => {
                leagueObj.currentMatchday = resp.data.competitions.find(league => league.code === leagueObj.leagueCode).currentSeason.currentMatchday;
            });
            console.log("########Pobrano currentMatchday z API########");
        })
}

async function getData(name, currentMatchday) {
    try {      
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
    const currentMatchday = leagueObjects[0].currentMatchday; //aktualna kolejka jest pobierana z obiektu PL z tablicy leagueObjects

    //Pobieramy z API aktualną kolejkę PL
    const currentMatchesPL = await axios.get(`https://api.football-data.org/v2/competitions/PL/matches?matchday=${currentMatchday}`, {
        headers: headers
    }).then(resp => resp.data.matches)

    console.log(`Aktualna kolejka PL: ${currentMatchday}`);
    
    //Sprawdzamy czy WSZYSTKIE MECZE Z API W PL AKTUALNEJ KOLEJKI są ZAKOŃCZONE
    let resultQueryFin = currentMatchesPL.every(match => match.status === "FINISHED");
    let resultQuerySch = currentMatchesPL.every(match => match.status === "SCHEDULED");


    //Jesli wszystkie mecze są zakończone, to usuwamy całą tabelę w BD oraz robimy requesta do API.
    //Jeśli zrobimy to gdy aktualną kolejką w API jest jeszcze kolejka poprzednia, 
    //to po prostu otrzymamy te same dane, jeśli nie to kolejkę następną od aktualnej oraz kolejną po niej
    if (resultQueryFin) {

        //Tak samo w BD trzeba sprawdzić czy wszystkie mecze są FINISHED, jeśli tak to nic nie zmieniaj
        const matches = await Match.find({
            gameweek: currentMatchday,
            leagueName: "Premier League"
        });
        console.log(matches);
        let matchesFin = matches.every(match => match.status === "FINISHED");
        console.log(`matchesFin: ${matchesFin}`);
        if (matchesFin) {
            console.log(`Baza meczy jest aktualna`);
        } else {
            console.log(`Usunięto kolejkę`);
            await Match.deleteMany();
            leagueObjects.forEach(leagueObj => {
                getData(leagueObj.leagueCode, leagueObj.currentMatchday);
            });
            console.log(`DODANO DO BAZY`);
        }
    } else if (resultQuerySch) {

        //Tak samo w BD trzeba sprawdzić czy wszystkie mecze są SCHEDULED, jeśli tak to nic nie zmieniaj
        const matches = await Match.find({
            gameweek: currentMatchday,
            leagueName: "Premier League"
        });
        let matchesSch = matches.every(match => match.status === "SCHEDULED");
        console.log(`matchesSch: ${matchesSch}`);
        if (matchesSch) {
            console.log(`Baza meczy jest aktualna`);
        } else {
            console.log(`Usunięto kolejkę`);
            await Match.deleteMany();
            leagueObjects.forEach(leagueObj => {
                getData(leagueObj.leagueCode, leagueObj.currentMatchday);
            });
            console.log(`DODANO DO BAZY`);
        }
    } else {
        console.log(`Nie wszystkie mecze z kolejki mają ten sam status`);
    }
}

async function loadData() {
    await getCurrentMatchday()
    await ifDataExist()
}

loadData()


// ifDataExist();

// POST do bazy danych ostatniej i przyszłej kolejki
// leagueNames.forEach(name => {
//     getData(name)
// })