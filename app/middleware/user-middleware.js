//Zmienne przekazywane do widoków dla usera

module.exports = function (req, res, next) {
    //sprawdzenie czy user jest zalogowany, jeśli tak to w zmiennej user bedzie id, name itd
    //czyli jest true, bo coś z zmiennej jest, a jeśli nie to będzie false, bo nic tam nie ma
    res.locals.user = req.session.user 
    next();
};