const League = require('../db/models/league');

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
            'user', 
            'players'
        ]).exec();       

        const resultsCount = await League.find(where).count(); //ilość wszystkich lig
        const pagesCount = Math.ceil(resultsCount / perPage); //zaokrągla liczbe ilości stron

        // Przekazujemy wartości i wyświetlamy strone z ligami
        res.render('pages/leagues/leagues', {
            title: 'Ligi',
            leagues: leagues, //zamiast tego zapisu można po prostu napisać "leagues"
            page,   //która aktualnie jest strona
            pagesCount, 
            resultsCount    
        });
    }

    async showLeague(req, res) {
        const { name } = req.params;        
    
        //wczytujemy dane z bd
        const league = await League.findOne({ slug: name }).populate(['user', 'players']);        
    
        //Widok league.ejs, { parametry, które chcemy przesłać }
        res.render('pages/leagues/league', { 
            league,
            title: league?.name ?? 'Brak wyników',  //Wyświetl nazwe ligi lub gdy taka nie istnieje to "brak"
            name: league?.name,
            description: league?.description,
            players: league?.players,
            playersCount: league?.playersCount,
            privacy: league?.privacy,
            code: league?.code,
            user: league?.user,
        });
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
            playersCount: req.body.playersCount || undefined, //jeśli będzie pusty input to zostanie nadana wartość defaultowa, bez tego warunku zostanie nadana wartość "null"
            privacy: req.body.privacy,
            code: req.body.code,
            user: req.session.user._id, //przy tworzeniu ligi, przypisz lige do usera
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
        // league.user = req.session.user._id, //przypisz lige do usera

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
        //TUTAJ PODMIENIASZ, CHYBA TRZEBA ZMIENIC TYP ZEBY DODAWALO KOLEJNEGO GRACZA
        //league.players = req.session.user._id; //przypisz usera do ligi

        league.players.push(req.session.user._id); //dołączenie do tablicy graczy

        try {
            await league.save();
            res.redirect('/ligi');    //przekierowanie na jakis adres po zapisaniu            
        } catch (e) {
            console.log(e);
            //jeśli zostanie wyłapany błąd, to generujemy znowu tą stronę z formularzem i pokazujemy błędy
            res.render('pages/leagues/join', {
                title: 'Dołącz',
                errors: e.errors,
                form: req.body //musimy przesłać dane z formularza
            });
        }
    }

    async joinLeagueButton(req, res) {
        const { name } = req.params;
        const league = await League.findOne({ slug: name }); //wyszukujemy lige po slugu

        league.players.push(req.session.user._id); //dołączenie do tablicy graczy

        try {      
            await league.save();
            res.redirect('/ligi');    //przekierowanie na wyświetlenie lig
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new LeagueController();