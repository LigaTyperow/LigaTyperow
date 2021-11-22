const Match = require('../db/models/match.js');

class MatchController {
    async showMatches(req, res) {        
        const matches = await Match.find(); //wyświetlanie kolekcji z meczami
        res.status(200).json(matches); //parsuje dane na JSON
        /* Status 200 to wszystko OK - więcej statusów => kody odpowiedzi HTTP
        201 Create - tworzenie nowych dokumentów
        202 Accepted - dane zostały zaakceptowane
        204 No content - wszystko poszło w porządku, ale żadne dane nie są zwracane (przy usuwaniu)
        400 to Bad Request */    
    }

    postMatches(req, res) {
        //x-www-form-urlencoded - dodawanie danych przez formularz
        //raw - w czystej postaci        

        // console.log(req.body); //req.body to przekazywany obiekt
        const finishedMatches = req.body.finishedMatches; //tablica obiektów - ukończone mecze
        const upcomingMatches = req.body.upcomingMatches; //tablica obiektów - nadchodzące mecze
        const leagueName = req.body.leagueName; //jedna wartość - nazwa ligi

        finishedMatches.forEach(match => {
            const matchObject = new Match({
                leagueName: leagueName, 
                date: match.utcDate.slice(0, 10),
                gameweek: match.matchday,
                awayTeam: match.awayTeam.name,
                homeTeam: match.homeTeam.name,
                scoreHomeTeam: match.score.fullTime.homeTeam,
                scoreAwayTeam: match.score.fullTime.awayTeam,
                status: match.status,
            });

            try {
                //console.log(matchObject); 
                matchObject.save();
                res.status(201); //dokument został utworzony
            } catch (e) {
                console.log('error');
                res.status(422).json({
                    errors: e.errors
                }); //coś jest niepoprawnego i informacje
            }
        });

        upcomingMatches.forEach(match => {
            const matchObject = new Match({
                leagueName: leagueName, 
                date: match.utcDate.slice(0, 10),
                gameweek: match.matchday,
                awayTeam: match.awayTeam.name,
                homeTeam: match.homeTeam.name,
                scoreHomeTeam: match.score.fullTime.homeTeam,
                scoreAwayTeam: match.score.fullTime.awayTeam,
                status: match.status,
            });

            try {
                //console.log(matchObject); 
                matchObject.save();
                res.status(201); //dokument został utworzony
            } catch (e) {
                console.log('error');
                res.status(422).json({
                    errors: e.errors
                }); //coś jest niepoprawnego i informacje
            }
        });
    };
}

module.exports = new MatchController();