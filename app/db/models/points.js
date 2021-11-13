//Model będzie wykorzystany do sprawdzenia punktów w rankingu
// require('../mongoose'); //do testów, potem połączenie z bazą będzie użyte w index.js

const mongoose = require('mongoose'); //pobieramy mongoose
const Schema = mongoose.Schema; //pobieramy Schema
// const {  } = require('../validators'); //walidacje do konkretnych pól w osobnym pliku

//Stworzenie modelu, na podstawie, którego powstanie kolekcja
const pointsSchema = new Schema({
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
        type: mongoose.Types.ObjectId,
        // required: true,
        ref: 'Score'
    },        
});
//##############################################################
//Operacje po wpisaniu danych przez usera, na których możemy dokonać zmiany przed dodaniem do bd

const Points = mongoose.model('Points', pointsSchema);

//###############################################
//Do testowania nowych rekordów
/*
async function savePoints() {
    //utworzenie nowego elementu
    const points = new Points({        
        
    });

    try {
        await points.save();
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
savePoints();
// */
//###############################################

module.exports = Points;