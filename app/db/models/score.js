//Model do przypisywania wyniku danego meczu
// require('../mongoose'); //do testów, potem połączenie z bazą będzie użyte w index.js

const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
const { checkNumbers } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const scoreSchema = new Schema({       
    leagueName: {
        type: String,
    },
    gameweek: {
        type: String,
    },
    homeTeam: {
        type: String,
    },
    scoreHome: {
        type: Number,
        trim: true,
        required: [true, 'Wynik jest wymagany!'],
        minLength: [0, 'Minimalna liczba wyniku to 0'],
        maxLength: [20, 'Maksymalna liczba wyniku to 20'],
        default: 0,
        validate: [checkNumbers, 'Proszę wprowadzić cyfry!']
    },
    awayTeam: {
        type: String,
    },
    scoreAway: {
        type: Number,
        trim: true,
        required: [true, 'Wynik jest wymagany!'],
        minLength: [0, 'Minimalna liczba wyniku to 0'],
        maxLength: [20, 'Maksymalna liczba wyniku to 20'],
        default: 0,
        validate: [checkNumbers, 'Proszę wprowadzić cyfry!']
    },
    //referencje
    league: {
        type: mongoose.Types.ObjectId, 
        // required: true,
        ref: 'League' 
    },
    user: {
        type: mongoose.Types.ObjectId,
        // required: true,
        ref: 'User' 
    },
    points: {
        type: Number,
    }
});
//##############################################################
//Operacje po wpisaniu danych przez usera, na których możemy dokonać zmiany przed dodaniem do bd

const Score = mongoose.model('Score', scoreSchema);

//###############################################
//Do testowania nowych rekordów
/*
async function saveScore() {
    //utworzenie nowego elementu
    const score = new Score({        
        score: "2:1",
    });

    try {
        await score.save();
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
saveScore();
// */
//###############################################

module.exports = Score;