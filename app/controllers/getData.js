//Pobieranie danych GET z API i POST jako obiekt do kontrolera
const axios = require('axios');
const Match = require('../db/models/match.js');
// const Gameweek = require('../db/models/gameweek.js');

const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
}

// const leagueNames = ["PL", "BL1", "SA", "PD"] // skróty nazw lig to pobierania danych
const leagueObjects = [{
        leagueCode: "PL",
        leagueName: "Premier League",
        currentMatchday: null
    },

    {
        leagueCode: "BL1",
        leagueName: "Bundesliga",
        currentMatchday: null
    },

    {
        leagueCode: "SA",
        leagueName: "Serie A",
        currentMatchday: null
    },

    {
        leagueCode: "PD",
        leagueName: "Liga Santander",
        currentMatchday: null
    }
]

//Pobieramy aktualną kolejkę z API
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
        })
}

// async function postCurrentMatchday() {
//     zapisujemy aktualną kolejkę danej ligi do DB
//     leagueObjects.forEach(leagueObj => {
//         const leagueObject = new Match({
//             leagueName: leagueObj.leagueName, 
//             currentMatchday: leagueObj.currentMatchday,
//         });

//         try {
//             leagueObject.save();
//             console.log("########Zapisano currentMatchday do BD########");
//             // res.status(201); //dokument został utworzony
//         } catch (e) {
//             console.log('error');
//             // res.status(422).json({
//             //     errors: e.errors
//             // }); //coś jest niepoprawnego i informacje
//         }
//     });

//     await axios.post('http://localhost:80/api/matches', {
//         leagueObjects,
//     })
// }

//Pobieramy mecze konkretnych kolejek dla konkretnych lig
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
            upcomingMatches,
        })
    } catch (error) {
        console.error(error);
    }
}

//Sprawdzamy czy trzeba zaktualizować mecze w bazie danych
async function ifDataExist() {
    //W pętli sprawdzamy każdą ligę 
    leagueObjects.forEach(async leagueObj => {
        const currentMatchday = leagueObj.currentMatchday; //aktualna kolejka jest pobierana z obiektu z tablicy leagueObjects

        //Pobieramy z API aktualną kolejkę
        const currentMatches = await axios.get(
            `https://api.football-data.org/v2/competitions/${leagueObj.leagueCode}/matches?matchday=${currentMatchday}`, {
                headers: headers
            }).then(resp => resp.data.matches)

        console.log(`Aktualna kolejka ${leagueObj.leagueName}: ${currentMatchday}`);

        //Sprawdzamy czy WSZYSTKIE MECZE Z API W PL AKTUALNEJ KOLEJKI są ZAKOŃCZONE
        let resultQueryFin = currentMatches.every(match => match.status === "FINISHED");
        let resultQuerySch = currentMatches.every(match => match.status === "SCHEDULED");


        //Jesli wszystkie mecze są zakończone
        if (resultQueryFin) {

            //Tak samo w BD trzeba sprawdzić czy wszystkie mecze są FINISHED, jeśli tak to nic nie zmieniaj
            const matches = await Match.find({
                gameweek: currentMatchday,
                leagueName: leagueObj.leagueName
            });
            let matchesFin = matches.every(match => match.status === "FINISHED");
            console.log(`matchesFin ${leagueObj.leagueName}: ${matchesFin}`);
            if (matchesFin) {
                console.log(`Baza meczy ${leagueObj.leagueName} jest aktualna`);
            } else {
                //Usuwanie kolejki
                await Match.deleteMany({
                    leagueName: leagueObj.leagueName
                });

                //Dodawanie kolejki  
                getData(leagueObj.leagueCode, leagueObj.currentMatchday);
                console.log(`Zaktualizowano ligę ${leagueObj.leagueName}`);
            }
        } else if (resultQuerySch) {
            //Jesli wszystkie mecze są scheduled to sprawdzamy:
            //Tak samo w BD trzeba sprawdzić czy wszystkie mecze są SCHEDULED, jeśli tak to nic nie zmieniaj
            const matches = await Match.find({
                gameweek: currentMatchday,
                leagueName: leagueObj.leagueName
            });
            let matchesSch = matches.every(match => match.status === "SCHEDULED");
            console.log(`matchesSch ${leagueObj.leagueName}: ${matchesSch}`);
            if (matchesSch) {
                console.log(`Baza meczy ${leagueObj.leagueName} jest aktualna`);
            } else {   
                //Usuwanie kolejki             
                await Match.deleteMany({
                    leagueName: leagueObj.leagueName
                });

                //Dodawanie kolejki
                getData(leagueObj.leagueCode, leagueObj.currentMatchday);
                console.log(`Zaktualizowano ligę ${leagueObj.leagueName}`);
            }
        } else {
            console.log(`Nie wszystkie mecze z kolejki mają ten sam status`);
        }
    });
}

//Najpierw musimy pobrać aktualną kolejkę...
async function loadData() {
    await getCurrentMatchday()
    await ifDataExist()
    // await postCurrentMatchday()
}

loadData()

// POST do bazy danych ostatniej i przyszłej kolejki
// leagueNames.forEach(name => {
//     getData(name)
// })