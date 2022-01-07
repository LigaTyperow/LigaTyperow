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

//Pobieramy aktualną kolejkę z bazy
async function getCurrentMatchday() {
    //pobieramy aktualną kolejkę danej ligi
    for (const leagueObj of leagueObjects) {
        const nextGameweekMatches = await Match.find({                     
            leagueName: leagueObj.leagueName,
            status: "SCHEDULED"
        });
        // ostatni mecz kolejki z bazy przypisujemy do obiektu
        leagueObj.currentMatchday = nextGameweekMatches[(nextGameweekMatches.length)-1].gameweek;
    }   
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

        const currentMatchday = leagueObj.currentMatchday; //aktualna kolejka jest pobierana z obiektu z tablicy leagueObjects
    
        const nowDate = new Date();
         
        const nextGameweekMatches = await Match.find({                     
            leagueName: leagueObj.leagueName,
            status: "SCHEDULED"
        });

        console.log(`Aktualna kolejka ${leagueObj.leagueName}: ${currentMatchday}`);  

        // Data ostatniego meczu
        const lastMatchDate = new Date(nextGameweekMatches[(nextGameweekMatches.length)-1].date)  

        // Potrzebujemy datę zakończenia meczu, więc do godziny rozpoczęcia meczu dodajemy 2h
        lastMatchDate.setHours(lastMatchDate.getHours() + 2); 

        //Jesli wszystkie mecze są zakończone
        if (nowDate > lastMatchDate) {
           
            await Match.deleteMany({
                leagueName: leagueObj.leagueName
            });

            //Dodawanie kolejki  
            getData(leagueObj.leagueCode, currentMatchday);
            console.log(`Zaktualizowano ligę ${leagueObj.leagueName}`);

            leagueObj.isUpdated = true;           
        } else {
            //Jesli wszystkie mecze są scheduled to sprawdzamy:
            //Tak samo w BD trzeba sprawdzić czy wszystkie mecze są SCHEDULED, jeśli tak to nic nie zmieniaj
            console.log(`W lidze ${leagueObj.leagueName} ostatni mecz się jeszcze nie skonczyl`);
            leagueObj.isUpdated = false;
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
                gameweek: leagueObj.currentMatchday
                // status: 'FINISHED'
            });
            
            //typy użytkownika
            const scores = await Score.find({
                leagueName: leagueObj.leagueName,
                gameweek: leagueObj.currentMatchday
            }); 

            // Musimy przejść po wszystkich wynikach
            for (const score of scores) {
                //trzeba wyszukać ten sam mecz w tabeli Matches
                let sameMatch = matches.find(element => {
                    if (score.homeTeam === element.homeTeam) {
                        return score.homeTeam;
                    }
                });
                // console.log(`ZNALEZIONY MECZ TO: ${sameMatch} === ${score}`);
                let points = 0;

                // Sprawdzamy czy wytypowano prawidłowy rezultat meczu
                if ((score.scoreHome > score.scoreAway &&
                        sameMatch.scoreHomeTeam > sameMatch.scoreAwayTeam) ||
                    (score.scoreHome < score.scoreAway &&
                        sameMatch.scoreHomeTeam < sameMatch.scoreAwayTeam) ||
                    (score.scoreHome === score.scoreAway &&
                        sameMatch.scoreHomeTeam === sameMatch.scoreAwayTeam)) {
                    points += 1;
                }

                //Sprawdzamy czy wytypowano prawidłowy wynik meczu
                if ((score.scoreHome == sameMatch.scoreHomeTeam) && (score.scoreAway == sameMatch.scoreAwayTeam)) {                    
                    points += 2;
                }

                score.points = points;

                try {
                    await score.save();
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
    // TESTOWANIE NA SZTYWNO
        // leagueObjects.forEach(leagueObj => {
        //     getData(leagueObj.leagueCode, leagueObj.currentMatchday)
        // })
    await ifDataExist()
    setTimeout(() => { addPoints() }, 5000);
}

// loadData()