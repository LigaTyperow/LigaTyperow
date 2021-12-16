const League = require('../db/models/league');
const Match = require('../db/models/match');
const Score = require('../db/models/score');

class LeagueController {

    async showLeagues(req, res) {
        /* q=searchBar
           sort=sortowanie
           counts=filtrowanie */
        const { q, sort, countmin, countmax } = req.query; //pobieramy wartość ze sluga
        const page = req.query.page || 1; //jeśli nie podaliśmy strony to aktualnie jest strona pierwsza
        const perPage = 2; //ile wyników na per strone chce wyswietlic

        // SZUKANIE ##########################################
        const where = {};
        // https://docs.mongodb.com/manual/reference/operator/query/regex/
        if (q) {
            where.name = { $regex: q , $options: 'i' }; //wyrażenie regularne, "i" nierozróżnia wielkości liter
        } 
        
        // FILTROWANIE ##########################################
        // https://docs.mongodb.com/manual/reference/operator/aggregation/
        if (countmin || countmax) {
            where.playersCount = {}; //jeśli została podana wartość to tworzę obiekt
            if (countmin) where.playersCount.$gte = countmin; //gt=greater than, gte=większe lub równe
            if (countmax) where.playersCount.$lte = countmax; //lte=mniejsze lub równe
        }

        let query = League.find(where); //bez await, bo nie chce od razu szukać  
        

        // PAGINACJA ##########################################
        query = query.skip((page - 1) * perPage);   //od ktorego miejsca ma pobrac reszte wyników
        query = query.limit(perPage);   //limit ile wyników na jedną strone potrzebujesz

        // SORTOWANIE ##########################################
        if (sort) {
            //dzielimy parametr sort
            const s = sort.split('|');

            //funckcja mongoDB
            //asc - rosnąco, desc - malejąco
            //np name|asc to 0=name, a 1=asc
            query = query.sort({ [s[0]]: s[1] });
        }

        //uruchamiam moje query - z użytymi parametrami
        const leagues = await query.populate([
            //populate - dzięki temu, możemy odwołać się do konkretnego pola z kolekcji User, a nie samo id usera
            'owner', 
            'players'
        ]).exec();       

        const resultsCount = await League.find(where).countDocuments(); //ilość wszystkich lig
        const pagesCount = Math.ceil(resultsCount / perPage); //zaokrągla liczbe ilości stron

        // Przekazujemy wartości i wyświetlamy strone z ligami
        res.render('pages/leagues/leagues', {
            title: 'Ligi',
            leagues: leagues, //zamiast tego zapisu można po prostu napisać "leagues"
            page,   //która aktualnie jest strona
            pagesCount, 
            resultsCount,
        });
    }

    async showLeague(req, res) {
        const { name } = req.params;        
    
        //wczytujemy dane z bd
        const league = await League.findOne({ slug: name }).populate(['owner', 'players']);
        
        // RANKING #######################################################
            //wczytujemy konkretną ligę typowania do wyświetlenia rankingu
            const scores = await Score.find({ league: league._id }).populate(['user']);

            //Tablica obiektów dla każdego gracza, aby zliczyć punkty i posortować od najlepszego
            let playerObjects = []; 
            for (const player of league.players) {    
                let playerObj = {
                    playerNick: player.nick,
                    playerPoints: 0
                }

                let userPoints = 0; //Suma punktów z każdego typu
                
                for (const score of scores) {      
                    // Podliczanie punktów dla konkretnego gracza
                    if (score.user.nick == player.nick) {
                        // Sprawdzenie czy player coś typował
                        if (score.points >= 0) {
                            userPoints += score.points;
                        }
                    }
                }

                // Przypisanie zsumowanych pkt do obiektu konkretnego gracza
                playerObj.playerPoints = userPoints;
                playerObjects.push(playerObj);
            }
            // Sortowanie graczy od najlepszego
            playerObjects.sort((a, b) => (a.playerPoints > b.playerPoints) ? -1 : 1)  
                  
        // ###############################################################
        
        // MECZE DO TYPOWANIA LUB WYTYPOWANE WYNIKI
        const selectedLeague = league.selectedLeague; //przypisanie wybranej ligi piłkarskiej do ligi typowania
        const matches = await Match.find({ leagueName: selectedLeague, status: 'SCHEDULED'});
        let resultsHeader = `Wytypuj wyniki`;
        let gameweekHeader = `Kolejka ${matches[0].gameweek}`;
        let singleScore; 
        // sprawdzenie czy user jest zalogowany, jeśli tak to pokaż typowanie
        if (req.session.user) {
            //wczytujemy typy zalogowanego usera dla wyświetlanej ligi  
            singleScore = await Score.find({ user: req.session.user._id, league: league }); 

            //Jeśli istnieją wytypowane wyniki to zmień header h3
            if (singleScore.length > 0) {
                resultsHeader = 'Twoje TYPY';            
                gameweekHeader = `Kolejka ${singleScore[0].gameweek}`;            
            }                        
        } else {
            // console.log('dla niezalogowanego schowaj typowanie');
        }     

        //Widok league.ejs, { parametry, które chcemy przesłać }
        res.render('pages/leagues/league', { 
            league,
            scores,
            playerObjects,
            matches,
            singleScore,
            resultsHeader,
            gameweekHeader,
            title: league?.name ?? 'Brak wyników',  //Wyświetl nazwe ligi lub gdy taka nie istnieje to "brak"
            name: league?.name,
            description: league?.description,
            selectedLeague: league?.selectedLeague,
            players: league?.players,
            playersCount: league?.playersCount,
            privacy: league?.privacy,
            code: league?.code,
            owner: league?.owner,
        });
    }

    // TYPOWANIE
    async betButton(req, res) {
        const { name } = req.params;
        const league = await League.findOne({ slug: name });
        const selectedLeague = league.selectedLeague; //przypisanie wybranej ligi piłkarskiej do ligi typowania

        //pobieramy następną kolejkę
        const matches = await Match.find({ leagueName: selectedLeague, status: 'SCHEDULED'});  
        
        // TYPOWANIE
        for(const [index, match]  of matches.entries()){
            const score = new Score({  
                leagueName: selectedLeague,
                gameweek: match.gameweek,
                homeTeam: match.homeTeam,
                scoreHome: req.body.homeTeamScore[index] || undefined, //jeśli będzie pusty input to zostanie nadana wartość defaultowa, bez tego warunku zostanie nadana wartość "null"
                awayTeam: match.awayTeam,
                scoreAway: req.body.awayTeamScore[index] || undefined,
                league: league, //req.params;
                user: req.session.user._id, //przypisanie wyników do usera
            });
    
            try {                                      
                console.log('Zapisano TYPY!');
                await score.save();  
            } catch (e) {
                console.log('PROBLEM Z TYPOWANIEM');
                console.log(e);
            }
        }   
        
        // Po wciśnięciu przycisku Wytypuj, odświeżamy stronę
        try { 
            res.redirect(`/ligi/${name}`); 
        } catch (e) {            
            console.log(e);
            // res.render('pages/leagues');
        }
    }

    showCreateLeagueForm(req, res) {
        res.render('pages/leagues/create', {
            title: 'Nowa liga'
        });
    }

    //musi być async, bo bedziemy łaczyc sie z bazą danych
    async createLeague(req, res) {
        //zapisanie wpisanych danych do bd
        const league = new League({            
            name: req.body.name,
            description: req.body.description,
            selectedLeague: req.body.selectedLeague,
            playersCount: req.body.playersCount || undefined, //jeśli będzie pusty input to zostanie nadana wartość defaultowa, bez tego warunku zostanie nadana wartość "null"
            privacy: req.body.privacy,
            code: req.body.code,
            owner: req.session.user._id, //przy tworzeniu ligi, przypisz lige do usera
        });

        try {
            await league.save();
            res.redirect('/ligi');    //przekierowanie na adres po zapisaniu (wyświetlenie lig)           
        } catch (e) {
            //jeśli zostanie wyłapany błąd, to generujemy znowu tą stronę z formularzem i pokazujemy błędy
            res.render('pages/leagues/create', {
                title: 'Nowa liga',
                errors: e.errors,
                form: req.body //musimy przesłać dane z formularza
            });
        }
    }

    // EDYCJA
    async showEditLeagueForm(req, res) {
        const { name } = req.params;
        const league = await League.findOne({ slug: name });

        //potrzebujemy dane ligi, więc przekazujemy je
        res.render('pages/leagues/edit', {
            title: 'Edycja',
            form: league //użyjemy tego samego formularza
        });
    }

    //musi być async, bo bedziemy łaczyc sie z bd
    async editLeague(req, res) {
        //pobieramy lige
        const { name } = req.params;
        const league = await League.findOne({ slug: name });

        //podmieniamy pola w bd
        league.name = req.body.name;
        league.description = req.body.description;
        league.playersCount = req.body.playersCount;    
        league.privacy = req.body.privacy;    
        league.code = req.body.code;    

        try {
            await league.save();
            res.redirect('/ligi');    //przekierowanie na jakis adres po zapisaniu            
        } catch (e) {
            //jeśli zostanie wyłapany błąd, to generujemy znowu tą stronę z formularzem i pokazujemy błędy
            res.render('pages/leagues/edit', {
                title: 'Edycja',
                errors: e.errors,
                form: req.body //musimy przesłać dane z formularza
            });
        }
    }

    async deleteLeague(req, res) {
        const { name } = req.params;

        try {      
            await League.deleteOne({ slug: name });
            res.redirect('/ligi');    //przekierowanie na wyświetlenie lig
        } catch (e) {
            //błędy nieprzewidziane
        }
    }   

    // DOŁĄCZANIE DO LIGI
    async showJoinLeagueForm(req, res) {            
        res.render('pages/leagues/join', {
            title: 'Dołącz'
        });
    }

    async joinLeague(req, res) {
        const enteredCode = req.body.code;
        const league = await League.findOne({ code: enteredCode }); //wyszukujemy lige po kodzie

        // https://mongoosejs.com/docs/subdocs.html#adding-subdocs-to-arrays      

        //Po stronie backendu też powinniśmy zrobić walidację
        // Musimy użyć try catch w przypadku, gdy user poda np tylko jedną cyfre
        //Sprawdzamy czy zalogowany user istnieje juz do ligi i czy są jeszcze miejsca
        try {
            if ((!league.players.includes(req.session.user._id)) && (league.playersCount > league.players.length)) {
                league.players.push(req.session.user._id); //dołączenie do tablicy players                    
                
                await league.save();                
                res.render('pages/leagues/join', {
                    title: 'Dołącz',
                    success: true                    
                });
            } else {
                console.log(`TEN USER JUZ JEST W TEJ LIDZE LUB NIE MA MIEJSC`);
                res.render('pages/leagues/join', {
                    title: 'Dołącz',
                    errors: true,
                    form: req.body //musimy przesłać dane z formularza
                });
            }  
        } catch (e) {
            console.log(e);
            res.render('pages/leagues/join', {
                title: 'Dołącz',
                errors: true,
                form: req.body //musimy przesłać dane z formularza
            });
        }
    }

    async joinLeagueButton(req, res) {
        const { name } = req.params;
        const league = await League.findOne({ slug: name }); //wyszukujemy lige po slugu    

        //Po stronie backendu też powinniśmy sprawdzać czy user należy już do ligi
            //jeśli w tablicy obiektów players istnieje id zalogowanego usera to... 
        if (league.players.includes(req.session.user._id)) {
            console.log(`TEN USER JUZ JEST W TEJ LIDZE`);
        } else {
            league.players.push(req.session.user._id); //dołączenie do tablicy graczy 

            try {      
                await league.save();
                res.redirect('/ligi');    //przekierowanie na wyświetlenie lig
            } catch (e) {
                console.log(e);
            }
        }     
    }

    async leaveLeagueButton(req, res) {
        const { name } = req.params;
        const league = await League.findOne({ slug: name }); //wyszukujemy lige po slugu    
        
        //Po stronie backendu też powinniśmy sprawdzać czy user należy już do ligi
            //jeśli w tablicy obiektów players istnieje id zalogowanego usera to... 
        if (league.players.includes(req.session.user._id)) {            
            league.players.pull(req.session.user._id); //dołączenie do tablicy graczy 

            try {      
                await league.save();
                res.redirect('/ligi');    //przekierowanie na wyświetlenie lig
            } catch (e) {
                console.log(e);
            }
        } else {    
            console.log(`TEN USER NIE JEST W TEJ LIDZE`);
        }     
    }
}

module.exports = new LeagueController();


