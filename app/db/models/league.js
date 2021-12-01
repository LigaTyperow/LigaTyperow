// require('../mongoose'); //do testów, potem połączenie z bazą będzie użyte w index.js

const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
const uniqueValidator = require('mongoose-unique-validator'); //lib do walidacji unique
const { engCharacters } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const leagueSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nazwa jest wymagana!'],
        minLength: [3, 'Minimalna liczba znaków to 3!'],
        maxLength: [30, 'Maksymalna liczba znaków to 30!'],
        unique: true,
        validate: [engCharacters, 'Znaki specjalne są niedozwolone!'],
    },
    slug: {
        type: String,
        trim: true,
        lowercase: true,
    },
    selectedLeague: {
        type: String,
        required: [true, 'Proszę wybrać ligę!'],
        // enum: {
        //     values: ['Premier League', 'Bundesliga', 'Serie A', 'Liga Santander'],
        //     message: 'Błąd! Proszę wybrać: Premier League, Bundesliga, Serie A, Liga Santander'
        // },
    },
    description: {
        type: String,
        maxLength: [50, 'Maksymalna liczba znaków to 50!'],
    },
    playersCount: {
        type: Number,
        required: [true, 'Liczba graczy jest wymagana!'],
        min: [1, 'Najmniejsza liczba graczy to 1!'],
        max: [20, 'Największa liczba graczy to 20!'],
        default: 1,
    },
    privacy: {
        type: String,
        required: [true, 'Pole prywatności jest wymagane!'],
        lowercase: true,
        enum: {
            values: ['publiczna', 'prywatna'],
            message: 'Błąd! Proszę wybrać: publiczna lub prywatna.'
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
    //referencja do użytkownika - przy tworzeniu ligi przypisujemy ją do usera      
    owner: {
        //Właściciel
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // dokument players może mieć wielu użytkowników, więc jest w tablicy (liga ma wielu graczy)
    players: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
});
//##############################################################
//Operacje po wpisaniu danych przez usera, na których możemy dokonać zmiany przed dodaniem do bd

//przypisanie name do slug
leagueSchema.pre('save', function (next) {
    const league = this;
    //jeśli liga nie jest dodawana/modyfikowana to nic nie rób, a jeśli tak to przypisz nazwe ligi do slug
    if (!league.isModified('name')) {
        return next();
    } else {
        //slug nie może mieć spacji
        league.slug = league.name.replace(/\s+/g, '');
        next();
    }
});

//Sprawdzanie unikalności nazwy i kodu
leagueSchema.plugin(uniqueValidator, {
    message: 'Ten {PATH} już istnieje!'
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
        // duration: '2021-10-26',
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