// require('../mongoose'); //do testów, potem połączenie z bazą będzie użyte w index.js

const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
const { checkDuration } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const leagueSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nazwa jest wymagana!'],
        minLength: [3, 'Minimalna liczba znaków to 3!'],
        maxLength: [30, 'Maksymalna liczba znaków to 30!'],
        unique: true,
    },
    description: {
        type: String,
    },
    privacy: {
        type: String,
        required: [true, 'Pole prywatności jest wymagane!'],
        lowercase: true,  
        enum: {
            values: ['publiczna', 'prywatna'],
            message: 'Niepoprawne pole prywatności! Proszę wybrać: publiczna lub prywatna.'
        },
    },
    code: {
        type: String,
        required: [true, 'Kod do ligi jest wymagany!'],
        minLength: [3, 'Minimalna liczba znaków to 3!'],
        maxLength: [30, 'Maksymalna liczba znaków to 30!'],
        lowercase: true, 
        trim: true,
        unique: true,
    },
    duration: {
        type: String,
        required: [true, 'Długość trwania ligi jest wymagana!'],
        validate: [checkDuration, 'Proszę wprowadzić termin zakończenia trwania ligi w formacie YYYY-MM-DD!'],
    },
    //referencja do użytkownika
    user: {
        type: mongoose.Types.ObjectId,
        // required: true,
        ref: 'User' //potem w konkretnym controlerze użyjemy tego pola, np żeby zobaczyć w lidze usera
    },
});
//##############################################################
//Operacje po wpisaniu danych przez usera, na których możemy dokonać zmiany przed dodaniem do bd

//API: Schema.prototype.post() - uruchamia się po zapisie
leagueSchema.post('save', function(error, doc, next) {
    if (error.code === 11000) {
        //1100 to kod błędu dla pola "unique"
        error.errors = {
            name: { message: 'Ta nazwa ligi jest już zajęta!'},
            code: { message: 'Ten kod ligi jest już zajęty!'},
        };
    }
    next(error);
});

const League = mongoose.model('League', leagueSchema);

//###############################################
//Do testowania nowych rekordów
/*
async function saveLeague() {
    //utworzenie nowego elementu
    const league = new League({        
        name: 'Liga angielska',
        privacy: 'publiczna',
        code: 'liga123',
        duration: '2021-10-26',
    });

    try {
        await league.save();
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
saveLeague();
// */
//###############################################

module.exports = League;