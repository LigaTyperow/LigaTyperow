const Match = require('../db/models/match');
// const {
//     getDataForSheduleCJS
// } = require('../../public/script/apiRequest.js');

class MatchController {
    async showMatches(req, res) {
        //wysyłam wszystkie firmy
        const matches = await Match.find();
        res.status(200).json(matches); //parsuje dane na JSON
        //Status 200 to wszystko OK - więcej statusów => kody odpowiedzi HTTP
        //201 Create - tworzenie nowych dokumentów
        //202 Accepted - dane zostały zaakceptowane
        //204 No content - wszystko poszło w porządku, ale żadne dane nie są zwracane (przy usuwaniu)
        //400 to Bad Request
        console.log('show');
    }

    async create(req, res) {
        //dodawanie nowych danych Postman - POST > Body:
        //x-www-form-urlencoded - dodawanie danych przez formularz
        //raw - w czystej postaci
        //zapisanie wpisanych danych do bd

        const nameLeague = 'PL';

        // fetch(`https://api.football-data.org/v2/competitions/${nameLeague}/matches`, {
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'X-Auth-Token': '06900aadf8064cdab4775b8b1c19db88'
        //         }
        //     }).then(resp => resp.json())
        //     .catch((error) => {
        //         alert("Wystąpił problem z danymi")
        //         console.error('Error:', error);
        //     });

        const getDataForSheduleCJS = () => {
            fetch(`https://api.football-data.org/v2/competitions/PL/matches`, {
                headers: {
                  'Content-Type': 'application/json',
                  'X-Auth-Token': personalToken
            }}).then(resp => resp.json())
            // .then(data => data)
            .catch((error) => {
                alert("Wystąpił problem z danymi")
                console.error('Error:', error);
            });
        }

        const match = getDataForSheduleCJS(nameLeague).then(resp => {
            const matchObject = new Match({
                leagueName: resp.competition.name,
                date: resp.utcDate.slice(0, 10),
                awayTeam: resp.awayTeam.name,
                homeTeam: resp.homeTeam.name,
                scoreHomeTeam: resp.score.fullTime.homeTeam,
                scoreAwayTeam: resp.score.fullTime.awayTeam,
                // employeesCount: req.body.employeesCount || undefined, //if wil pusty input to też zostanie nadana wartość defaultowa, bez tego zostanie nadana wartość "null"
            });
            return matchObject;
        });

        // const match = new Match({
        //     leagueName: req.competition.name,
        //     date: req.utcDate.slice(0, 10),
        //     awayTeam: req.awayTeam.name,
        //     homeTeam: req.homeTeam.name,
        //     scoreHomeTeam: req.score.fullTime.homeTeam,
        //     scoreAwayTeam: req.score.fullTime.awayTeam,
        //     // employeesCount: req.body.employeesCount || undefined, //if wil pusty input to też zostanie nadana wartość defaultowa, bez tego zostanie nadana wartość "null"
        // });

        // const match = new Match({
        //     leagueName: 'Bundes'
        // });

        //console.log(match);
        // console.log('test');

        try {
            console.log(match);
            await match.save();
            //res.status(201).json(match); //dokument został utworzony i zwracamy dane firmy
        } catch (e) {
            console.log('error');
            res.status(422).json({
                errors: e.errors
            }); //coś jest niepoprawnego i info co
        }
    }
}

module.exports = new MatchController();