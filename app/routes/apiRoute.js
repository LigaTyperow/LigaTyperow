const express = require('express');
const router = new express.Router(); //zmieniamy nazwy z app.get na router.get
const MatchController = require('../controllers/match-controller');

router.get('/matches', MatchController.showMatches);
router.post('/matches', MatchController.create);

module.exports = router;