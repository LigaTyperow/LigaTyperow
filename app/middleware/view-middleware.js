//Zmiene przekazywane do widoków

module.exports = function (req, res, next) {
    res.locals.url = req.url;   //w odpowiedzi przekazuje zmienną
    res.locals.errors = null; //aby łatwiej sprawdzać błędy używamy zamiast " typeof errors !== 'undefined' "
    res.locals.success = null; //potwierdzeni danej operacji, można ją przekazać do pliku .ejs na frontend
    res.locals.form = {}; //obiekt, żeby łatwiej sprawdzic w kodzie html    
    res.locals.query = req.query; //po wyszukiwaniu wartość zostaje w textBoxie
    next();
};