// const Gameweek = require('../db/models/gameweek.js');
const Match = require('../db/models/match.js');

class MatchController {   

    async postMatches(req, res) {        
        // console.log(req.body); //req.body to przekazywany obiekt
        const finishedMatches = req.body.currentMatches; //tablica obiektów - ukończone mecze
        const upcomingMatches = req.body.upcomingMatches; //tablica obiektów - nadchodzące mecze
        const leagueName = req.body.leagueName; //jedna wartość - nazwa ligi          

        for (const match of finishedMatches) {
            const matchObject = new Match({
                leagueName: leagueName,
                date: match.utcDate,
                gameweek: match.matchday,
                awayTeam: match.awayTeam.name,
                homeTeam: match.homeTeam.name,
                scoreHomeTeam: match.score.fullTime.homeTeam,
                scoreAwayTeam: match.score.fullTime.awayTeam,
                status: match.status,
            });

            try {
                //console.log(matchObject); 
                await matchObject.save();
                res.status(201); //dokument został utworzony
            } catch (e) {
                console.log('error');
                res.status(422).json({
                    errors: e.errors
                }); 
            }
        }

        for (const match of upcomingMatches) {
            const matchObject = new Match({
                leagueName: leagueName,
                // date: match.utcDate.slice(0, 10),
                date: match.utcDate,
                gameweek: match.matchday,
                awayTeam: match.awayTeam.name,
                homeTeam: match.homeTeam.name,
                scoreHomeTeam: match.score.fullTime.homeTeam,
                scoreAwayTeam: match.score.fullTime.awayTeam,
                status: match.status,
            });

            try {
                //console.log(matchObject); 
                await matchObject.save();
                res.status(201); //dokument został utworzony
            } catch (e) {
                console.log('error');
                res.status(422).json({
                    errors: e.errors
                }); 
            }
        }
    };
}

module.exports = new MatchController();