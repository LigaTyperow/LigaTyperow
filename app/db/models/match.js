//Model do pobierania konkretnego meczu z danej kolejki
// require('../mongoose'); //do testów, potem połączenie z bazą będzie użyte w index.js

const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
// const { } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const matchSchema = new Schema({
    leagueName: {
        type: String,
    },
    date: {
        type: String,
    },
    gameweek: {
        type: String,
    },
    awayTeam: {
        type: String,
    },
    homeTeam: {
        type: String,
    },
    scoreHomeTeam: {
        type: Number,
    },
    scoreAwayTeam: {
        type: Number,
    },    
    status: {
        type: String,
    },    
    //referencje
    // gameweek: {
    //     //odwołanie do API
    // },
    // match: {
    //     //odwołanie do API        
    // },
});
//##############################################################
//Operacje po wpisaniu danych przez usera, na których możemy dokonać zmiany przed dodaniem do bd

const Match = mongoose.model('Match', matchSchema);

//###############################################
//Do testowania nowych rekordów
/*
async function saveMatch() {
    //utworzenie nowego elementu
    const match = new Match({        
        
    });

    try {
        await match.save();
        console.log(`Zapisano!`);
    } catch (e) {
        console.log(`Coś poszło nie tak`);

        //Lepiej wyłapać wszystkie błędy automatycznie niż po kolei
        for (const key in e.errors) {
            console.log(e.errors[key].message);
        }
        console.log(e);
    }
}
saveMatch();
// */
//###############################################

module.exports = Match;