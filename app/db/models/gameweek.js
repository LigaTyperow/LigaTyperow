const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
const bcrypt = require('bcrypt'); //biblioteka do hashowania hasła
// const {  } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const gameweekSchema = new Schema({
    // nick: {
    //     type: String,
    //     required: [true, 'Pole nick jest wymagane'],
    //     minLength: [3, 'Minimalna liczba znaków to 3'],
    //     unique: true, //nie można tutaj wyświetlić informacji o błędzie, zostanie dodana niżej jako middleware
    // },
    // email: {
    //     type: String,
    //     required: [true, 'Pole email jest wymagane'],
    //     lowercase: true,
    //     trim: true,
    //     unique: true, 
    //     validate: [checkEmail, 'Niepoprawny email!'],
    // },
    // password: {
    //     type: String,
    //     required: [true, 'Pole hasło jest wymagane'],
    //     validate: [checkPassword, 'Hasło musi zawierać od 6 do 20 znaków, przynajmniej 1 cyfra, 1 duża i 1 mała litera!'],
    // },
});
//##############################################################
//Operacje po wpisaniu danych przez usera, na których możemy dokonać zmiany przed dodaniem do bd

//API: Schema.prototype.post() - uruchamia się po zapisie
// gameweekSchema.post('save', function(error, doc, next) {
//     if (error.code === 11000) {
//         //1100 to kod błędu dla pola "unique"
//         error.errors = {
//             nick: { message: 'Taki nick jest już zajęty'},
//             email: { message: 'Taki email jest już zajęty'}
//         };
//     }
//     next(error);
// });

//metody ogólnodostępne
// gameweekSchema.methods = {
//     comparePassword(password) {
//         return bcrypt.compareSync(password, this.password);
//     }
// }

const Gameweek = mongoose.model('Gameweek', gameweekSchema);
module.exports = Gameweek;