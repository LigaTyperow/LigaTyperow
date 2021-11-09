//Model do przypisywania wyniku danego meczu
// require('../mongoose'); //do testów, potem połączenie z bazą będzie użyte w index.js

const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
const { checkScore } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const scoreSchema = new Schema({
    score: {
        type: String,
        trim: true,
        required: [true, 'Wynik jest wymagany!'],
        minLength: [3, 'Minimalna liczba znaków to 3, np "2:1"'],
        maxLength: [5, 'Maksymalna liczba znaków to 5, np "10:12"'],
        validate: [checkScore, 'Proszę wprowadzić poprawnie wynik, np "2:1"']
    },
    points: {
        type: Number,
        min: [0, 'Najmniejsza liczba puntków to 0!'],
    },    
    //referencje
    match: {
        type: mongoose.Types.ObjectId, 
        // required: true,
        ref: 'Match' 
    },
    user: {
        type: mongoose.Types.ObjectId,
        // required: true,
        ref: 'User' //potem w konkretnym controlerze użyjemy tego pola, np żeby zobaczyć w lidze usera
    },
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