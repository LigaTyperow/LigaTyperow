// require('../mongoose'); //do testów, potem połączenie z bazą będzie użyte w index.js

const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
const bcrypt = require('bcrypt'); //biblioteka do hashowania hasła
const { checkEmail, checkPassword } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const userSchema = new Schema({
    nick: {
        type: String,
        required: [true, 'Pole nick jest wymagane'],
        minLength: [3, 'Minimalna liczba znaków to 3'],
        unique: true, //nie można tutaj wyświetlić informacji o błędzie, zostanie dodana niżej jako middleware
    },
    //pytanie czy chcemy użyć login??
    login: {
        type: String,
        required: [true, 'Pole login jest wymagane'],
        minLength: [3, 'Minimalna liczba znaków to 3'],
        unique: true, 
    },
    email: {
        type: String,
        required: [true, 'Pole email jest wymagane'],
        lowercase: true,
        trim: true,
        unique: true, 
        validate: [checkEmail, 'Niepoprawny email!'],
    },
    password: {
        type: String,
        required: [true, 'Pole hasło jest wymagane'],
        validate: [checkPassword, 'Hasło musi zawierać od 6 do 20 znaków, przynajmniej 1 cyfra, 1 duża i 1 mała litera!'],
    },
});
//##############################################################
//Operacje po wpisaniu danych przez usera, na których możemy dokonać zmiany przed dodaniem do bd

//hashowanie hasła
userSchema.pre('save', function(next) {
    const user = this;
    //salt - dodatkowe zabezpieczenie utrudniające łamanie haseł (dodaje wartość do hasła)
    if (!user.isModified('password')) {
        return next();
    } else {
        const salt = bcrypt.genSaltSync(10); //10 to moc obliczeniowa
        const hash = bcrypt.hashSync(user.password, salt);
        user.password = hash;
        next();
    }
});

//API: Schema.prototype.post() - uruchamia się po zapisie
userSchema.post('save', function(error, doc, next) {
    if (error.code === 11000) {
        //1100 to kod błędu dla pola "unique"
        error.errors = {
            nick: { message: 'Taki nick jest już zajęty'},
            login: { message: 'Taki login jest już zajęty'},
            email: { message: 'Taki email jest już zajęty'}
        };
    }
    next(error);
});

const User = mongoose.model('User', userSchema);

//###############################################
//Do testowania nowych rekordów
/*
async function saveUser() {
    //utworzenie nowego elementu
    const user = new User({        
        nick: 'Kubi',
        login: 'kubi99',
        email: 'jk@wp.pl',
        password: 'Haslo1',
    });

    try {
        await user.save();
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
saveUser();
*/
//###############################################

module.exports = User;