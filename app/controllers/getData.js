//Pobieranie danych GET z API i POST jako obiekt do kontrolera

const axios = require('axios');

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
        const currentMatchday = await axios.get(`http://api.football-data.org/v2/competitions/${name}`, {
            headers: headers
        }).then(resp => resp.data.currentSeason.currentMatchday)

        // console.log(`${name}: ${currentMatchday}`);

        const matchData = await axios.get(`https://api.football-data.org/v2/competitions/${name}/matches?matchday=${currentMatchday}`, {
            headers: headers
        }).then(resp => resp.data.matches)
        //     {
        //     console.log(resp.data);
        //     const matches = resp.data.matches; //mecze w danej kolejce
        //     const leagueName = resp.data.competition.name; //nazwa ligi
        // })

        await axios.post('http://localhost:80/api/matches', {
            matchData,
            name
        })
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