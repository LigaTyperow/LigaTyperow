const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
// const {  } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const gameweekSchema = new Schema({
    leagueName: {
        type: String,
    },
    currentMatchday: {
        type: Number,
    },
});

const Gameweek = mongoose.model('Gameweek', gameweekSchema);

module.exports = Gameweek;