//Pobieranie danych GET z API i POST jako obiekt do kontrolera
const axios = require('axios');
const Match = require('../db/models/match.js');
const Score = require('../db/models/score.js');
// const Gameweek = require('../db/models/gameweek.js');

const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
}

// const leagueNames = ["PL", "BL1", "SA", "PD"] // skróty nazw lig to pobierania danych
const leagueObjects = [
    {
        leagueCode: "PL",
        leagueName: "Premier League",
        currentMatchday: null,
        isUpdated: null
    },

    {
        leagueCode: "BL1",
        leagueName: "Bundesliga",
        currentMatchday: null,
        isUpdated: null
    },

    {
        leagueCode: "SA",
        leagueName: "Serie A",
        currentMatchday: null,
        isUpdated: null
    },

    {
        leagueCode: "PD",
        leagueName: "Liga Santander",
        currentMatchday: null,
        isUpdated: null
    }
]

//Pobieramy aktualną kolejkę z API
async function getCurrentMatchday() {
    //pobieramy aktualną kolejkę danej ligi
    await axios.get(`http://api.football-data.org/v2/competitions`, {
            headers: headers
        })
        .then(resp => {
            // index = resp.data.competitions.indexOf(leagueObj);
            leagueObjects.forEach(leagueObj => {
                leagueObj.currentMatchday = resp.data.competitions.find(league => league.code === leagueObj.leagueCode).currentSeason.currentMatchday;
            });
        })
}

//Pobieramy mecze konkretnych kolejek dla konkretnych lig
async function getData(name, currentMatchday) {
    try {
        //pobieramy mecze z ostatniej kolejki
        const currentMatches = await axios.get(`https://api.football-data.org/v2/competitions/${name}/matches?matchday=${currentMatchday}`, {
            headers: headers
        }).then(resp => resp.data.matches)

        //ABY COFNĄĆ DLA TESTU KOLEJKĘ WYŻEJ: parseInt(currentMatchday)-1 A NIŻEJ USUWASZ +

        const upcomingMatchday = parseInt(currentMatchday)+1;

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

    for (const leagueObj of leagueObjects) {

        const currentMatchday = leagueObj.currentMatchday ; //aktualna kolejka jest pobierana z obiektu z tablicy leagueObjects

        //Pobieramy z API aktualną kolejkę
        const currentMatches = await axios.get(
            `https://api.football-data.org/v2/competitions/${leagueObj.leagueCode}/matches?matchday=${currentMatchday}`, {
                headers: headers
            }).then(resp => resp.data.matches)

        console.log(`Aktualna kolejka ${leagueObj.leagueName}: ${currentMatchday}`);

        //filtrujemy wyniki z api, tak by zostały tylko mecze Scheduled LUB Finished
        const filteredMatches = currentMatches.filter(match => match.status === "FINISHED" || match.status === "SCHEDULED")
        
        //Sprawdzamy czy WSZYSTKIE MECZE Z API W PL AKTUALNEJ KOLEJKI są ZAKOŃCZONE
        let resultQueryFin = filteredMatches.every(match => match.status === "FINISHED");
        let resultQuerySch = filteredMatches.every(match => match.status === "SCHEDULED");

        //Jesli wszystkie mecze są zakończone
        if (resultQueryFin) {

            //Tak samo w BD trzeba sprawdzić czy wszystkie mecze są FINISHED, jeśli tak to nic nie zmieniaj
            const matches = await Match.find({
                gameweek: currentMatchday,
                leagueName: leagueObj.leagueName
            });

            //Filtruje matches, aby były tylko mecze finished albo scheduled ( omija np. postponed)
            const filteredmatchesFin = matches.filter(match => match.status === "FINISHED" || match.status === "SCHEDULED")
            let matchesFin = filteredmatchesFin.every(match => match.status === "FINISHED");
            console.log(`matchesFin ${leagueObj.leagueName}: ${matchesFin}`);
            
            if (matchesFin) {
                console.log(`Baza meczy ${leagueObj.leagueName} jest aktualna`);

                leagueObj.isUpdated = false;
            } else {
                //Usuwanie kolejki
                await Match.deleteMany({
                    leagueName: leagueObj.leagueName
                });

                //Dodawanie kolejki  
                getData(leagueObj.leagueCode, leagueObj.currentMatchday);
                console.log(`Zaktualizowano ligę ${leagueObj.leagueName}`);

                leagueObj.isUpdated = true;
            }
        } else if (resultQuerySch) {
            //Jesli wszystkie mecze są scheduled to sprawdzamy:
            //Tak samo w BD trzeba sprawdzić czy wszystkie mecze są SCHEDULED, jeśli tak to nic nie zmieniaj
            const matches = await Match.find({
                gameweek: currentMatchday,
                leagueName: leagueObj.leagueName
            });

            //Filtruje matches, aby były tylko mecze finished albo scheduled ( omija np. postponed)
            const filteredmatchesSch = matches.filter(match => match.status === "FINISHED" || match.status === "SCHEDULED")
            let matchesSch = filteredmatchesSch.every(match => match.status === "SCHEDULED");
            console.log(`matchesSch ${leagueObj.leagueName}: ${matchesSch}`);
           
            if (matchesSch) {
                console.log(`Baza meczy ${leagueObj.leagueName} jest aktualna`);

                leagueObj.isUpdated = false;
            } else {
                //Usuwanie kolejki             
                await Match.deleteMany({
                    leagueName: leagueObj.leagueName
                });

                //Dodawanie kolejki
                getData(leagueObj.leagueCode, leagueObj.currentMatchday);
                console.log(`Zaktualizowano ligę ${leagueObj.leagueName}`);

                leagueObj.isUpdated = true;
            }
        } else {
            console.log(`W lidze ${leagueObj.leagueName} nie wszystkie mecze z kolejki mają ten sam status`);
        }
    }
}

async function addPoints() {
    //sprawdzamy czy została zaktualizowana kolejka dla danej ligi
    for (const leagueObj of leagueObjects) {
        console.log(`Status isUpdated ${leagueObj.isUpdated} dla ligi ${leagueObj.leagueName}`);
        if (leagueObj.isUpdated) {
            //mecze zakończone z wynikami do porownania z typami
            const matches = await Match.find({
                leagueName: leagueObj.leagueName,
                status: 'FINISHED'
            });

            //typy użytkownika
            const scores = await Score.find({
                leagueName: leagueObj.leagueName,
                gameweek: leagueObj.currentMatchday
            });

            for (const match of matches) {
                //trzeba wyszukać ten sam mecz w tabeli Scores
                let sameMatch = scores.find(element => {
                    if (element.homeTeam === match.homeTeam) {
                        return element.homeTeam;
                    }
                });
                // console.log(`ZNALEZIONY MECZ TO: ${sameMatch} === ${match}`);
                let points = 0;

                // Sprawdzamy czy wytypowano prawidłowy rezultat meczu
                if ((sameMatch.scoreHome > sameMatch.scoreAway &&
                        match.scoreHomeTeam > match.scoreAwayTeam) ||
                    (sameMatch.scoreHome < sameMatch.scoreAway &&
                        match.scoreHomeTeam < match.scoreAwayTeam) ||
                    (sameMatch.scoreHome === sameMatch.scoreAway &&
                        match.scoreHomeTeam === match.scoreAwayTeam)) {
                    points += 1;
                }

                //Sprawdzamy czy wytypowano prawidłowy wynik meczu
                if ((sameMatch.scoreHome == match.scoreHomeTeam) && (sameMatch.scoreAway == match.scoreAwayTeam)) {
                    //do wzynaczania winnera trzeba bedzie uzyc czy znaki <>
                    points += 2;
                }

                sameMatch.points = points;


                try {
                    await sameMatch.save();
                    console.log("Przydzielono punkty za typowanie");

                } catch (e) {
                    console.log('!!! Wykryto błąd z punktacją:')
                    console.log(e)
                }
            };
        } else {
            console.log("Liga nie została zaktualizowana");
        }
    }
}

//Najpierw musimy pobrać aktualną kolejkę...
async function loadData() {
    await getCurrentMatchday()
    // //TESTOWANIE NA SZTYWNO
    //     // leagueObjects.forEach(leagueObj => {
    //     //     getData(leagueObj.leagueCode, leagueObj.currentMatchday)
    //     // })
    await ifDataExist()
    await addPoints()
}
loadData()


// POST do bazy danych ostatniej i przyszłej kolejki
// leagueObjects.forEach(leagueObj => {
//     getData(leagueObj.name, leagueObj.currentMatchday)
// })