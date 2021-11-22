//Routingi czyli po wejściu na dany adres -> co się dzieje
//Czyli co ma się wykonywać po wejściu na dany adres

const express = require('express');
const router = new express.Router(); //zmieniamy nazwy z app.get na router.get
const PageController = require('../controllers/page-controller');
const UserController = require('../controllers/user-controller');
const LeagueController = require('../controllers/league-controller');

// STRONA GŁÓWNA
router.get('/', PageController.showHome);

// REJESTRACJA
router.get('/zarejestruj', UserController.showRegister); // wyświetlanie formularza
router.post('/zarejestruj', UserController.register); // obsługa rejestracji

// LOGOWANIE
router.get('/zaloguj', UserController.showLogin); // wyświetlanie formularza
router.post('/zaloguj', UserController.login); // obsługa logowania
router.get('/wyloguj', UserController.logout); // obsługa wylogowania

// EDYCJA PROFILU
router.get('/zalogowany/profil', UserController.showProfile); // wyświetlanie formularza
router.post('/zalogowany/profil', UserController.update); // obsługa zmiany danych w profilu

// LIGI DO TYPOWANIA
router.get('/ligi', LeagueController.showLeagues); //wyświetlenie wszystkich lig
router.get('/ligi/:name', LeagueController.showLeague); //wyświetlnie konkretnej ligi

// TWORZENIE NOWEJ LIGI
router.get('/zalogowany/ligi/dodaj', LeagueController.showCreateLeagueForm); //wyświetlenie formularza
router.post('/zalogowany/ligi/dodaj', LeagueController.createLeague); //obsługa formularza wysłanego za pomocą POST

// EDYCJA LIGI
router.get('/zalogowany/ligi/:name/edytuj', LeagueController.showEditLeagueForm); //wyświetlenie formularza
router.post('/zalogowany/ligi/:name/edytuj', LeagueController.editLeague); //obsługa formularza wysłanego za pomocą POST

// USUWANIE LIGI
router.get('/zalogowany/ligi/:name/usun', LeagueController.deleteLeague);

// BŁĘDNE ADRESY
router.get('*', PageController.showNotFound);

module.exports = router; //exportujemy routingi