const express = require('express');
const router = new express.Router(); //zmieniamy nazwy z app.get na router.get
const MatchController = require('../controllers/match-controller');

//mimo, że nie jest wywoływane, to ten require jest niezbędny do przekazania danych
const getData = require('../controllers/getData'); 

router.get('/matches', MatchController.showMatches);
router.post('/matches', MatchController.postMatches);

module.exports = router;