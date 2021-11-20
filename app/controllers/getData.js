//Pobieranie danych GET z API i POST jako obiekt do kontrolera

const axios = require('axios');

// W razie czego
// const headers = {
//     'Content-Type': 'application/json'
//   }

// konkretna kolejka
axios.get('https://api.football-data.org/v2/competitions/PL/matches?matchday=11', {
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
        }
    })
    .then(function (resp) {        
        const matches = resp.data.matches; //mecze w danej kolejce
        const leagueName = resp.data.competition.name; //nazwa ligi

        axios.post('http://localhost:80/api/matches', {matches, leagueName})
    })
    .catch(function (error) {
        console.log(error);
    })
    .then(function () {
        // wykona się zawsze, nawet jak będzie błąd
    });

// // Want to use async/await? Add the `async` keyword to your outer function/method.
// async function getUser() {
//   try {
//     const response = await axios.get('/user?ID=12345');
//     console.log(response);
//   } catch (error) {
//     console.error(error);
//   }
// }