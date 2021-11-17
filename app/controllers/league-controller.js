// const League = require('../db/models/league');

// class LeagueController {

//     async showLeagues(req, res) {
//         /* q=searchBar
//            sort=sortowanie
//            counts=filtrowanie */
//         const { q, sort, countmin, countmax } = req.query; //wyciągamy wartość ze sluga
//         const page = req.query.page || 1; //jeśli nie podałem strony to aktualnie jest strona 1wsza
//         const perPage = 2; //ile wyników na per strone chce wyswietlic

//         // SZUKANIE ##########################################
//         const where = {};
//         // https://docs.mongodb.com/manual/reference/operator/query/regex/
//         if (q) {
//             where.name = { $regex: q , $options: 'i' }; //wyrażenie regularne, "i" nierozróżnia wielkości liter
//         } 
        
//         // FILTROWANIE ##########################################
//         // https://docs.mongodb.com/manual/reference/operator/aggregation/
//         if (countmin || countmax) {
//             where.playersCount = {}; //jeśli została podana wartość to tworzę obiekt
//             if (countmin) where.playersCount.$gte = countmin; //gt=greater than, gte=większe lub równe
//             if (countmax) where.playersCount.$lte = countmax; //lte=mniejsze lub równe
//         }

//         let query = League.find(where); //bez await, bo nie chce od razu szukać  
        

//         // PAGINACJA ##########################################\
//         query = query.skip((page - 1) * perPage);   //od ktorego miejsca ma pobrac reszte wyników
//         query = query.limit(perPage);   //limit ile wyników na 1dną strone potrzebujesz

//         // SORTOWANIE ##########################################
//         if (sort) {
//             //dzielimy parametr sort
//             const s = sort.split('|');

//             //funckcja mongoDB
//             //asc - rosnąco, desc - malejąco
//             //np name|asc to 0=name, a 1=asc
//             query = query.sort({ [s[0]]: s[1] });
//         }

//         //uruchamiam moje query - z użytymi parametrami
//         const leagues = await query.populate('user').exec(); //populate - wypełnij pole user
        
//         const resultsCount = await League.find(where).count(); //ilość wszystkich firm
//         const pagesCount = Math.ceil(resultsCount / perPage); // zaokrągla liczbe ilości stron

//         // Przekazujemy wartości
//         res.render('pages/companies/companies', {
//             companies: leagues,
//             page,   //która aktualnie jest strona
//             pagesCount, 
//             resultsCount    
//         });
//     }

//     async showCompany(req, res) {
//         const { name } = req.params;        
    
//         //wczytujemy dane z bd
//         const company = await League.findOne({ slug: name });
    
//         //Widok company.ejs, { parametry, które chcesz przesłać }
//         res.render('pages/companies/company', { 
//             name: company?.name,
//             title: company?.name ?? 'Brak wyników'  //Wyświetl nazwe firmy lub gdy taka nie istnieje to "brak"
//         });
//     }

//     showCreateCompanyForm(req, res) {
//         res.render('pages/companies/create');
//     }

//     //musi być async, bo bedziemy łaczyc sie z bd
//     async createCompany(req, res) {
//         //zapisanie wpisanych danych do bd
//         const company = new League({
//             name: req.body.name,
//             slug: req.body.slug,
//             employeesCount: req.body.employeesCount || undefined, //if wil pusty input to też zostanie nadana wartość defaultowa, bez tego zostanie nadana wartość "null"
//             user: req.session.user._id, //przy tworzeniu firmy, przypisz firme do usera
//         });

//         try {
//             await company.save();
//             res.redirect('/firmy');    //przekierowanie na jakis adres po zapisaniu            
//         } catch (e) {
//             //jeśli zostanie wyłapany błąd, to generujemy znowu tą stronę z formularzem i pokazujemy błędy
//             res.render('pages/companies/create', {
//                 errors: e.errors,
//                 form: req.body //musimy przesłać dane z formularza
//             });
//         }
//     }

//     //Edit
//     async showEditCompanyForm(req, res) {
//         const { name } = req.params;
//         const company = await League.findOne({ slug: name });

//         //potrzebujemy dane firmy, więc przekazujemy je
//         res.render('pages/companies/edit', {
//             form: company //użyjemy tego samego formularza
//         });
//     }

//     //musi być async, bo bedziemy łaczyc sie z bd
//     async editCompany(req, res) {
//         //pobieramy firme
//         const { name } = req.params;
//         const company = await League.findOne({ slug: name });

//         //podmieniamy pola w bd
//         company.name = req.body.name;
//         company.slug = req.body.slug;
//         company.employeesCount = req.body.employeesCount;
        
//         // sprawdzenie czy dodawane jest nowe zdjęcie i czy zdjecie juz istnieje
//         if (req.file.filename && company.image) {
//             fs.unlinkSync('public/uploads/' + company.image); //wskazujemy zdjecie do usuniecia        
//         }
//         if (req.file.filename) {            
//             company.image = req.file.filename;
//         }

//         try {
//             await company.save();
//             res.redirect('/firmy');    //przekierowanie na jakis adres po zapisaniu            
//         } catch (e) {
//             //jeśli zostanie wyłapany błąd, to generujemy znowu tą stronę z formularzem i pokazujemy błędy
//             res.render('pages/companies/edit', {
//                 errors: e.errors,
//                 form: req.body //musimy przesłać dane z formularza
//             });
//         }
//     }

//     async deleteCompany(req, res) {
//         const { name } = req.params;
//         const company = await League.findOne({ slug: name });

//         try {
//             //jeśli istnieje zdjecie to je usun
//             if (company.image) {
//                 fs.unlinkSync('public/uploads/' + company.image); //wskazujemy zdjecie do usuniecia        
//             }

//             await League.deleteOne({ slug: name });
//             res.redirect('/firmy');    //przekierowanie na jakis adres po zapisaniu  
//         } catch (e) {
            
//         }
//     }

//     async deleteImage(req, res) {
//         const { name } = req.params;
//         const company = await League.findOne({ slug: name }); //pobieramy bieżącą firme

//         try {
//             fs.unlinkSync('public/uploads/' + company.image); //wskazujemy zdjecie do usuniecia
//             company.image = ''; //zresetuje wartosc image, zeby byla pusta
//             await company.save();

//             res.redirect('/firmy');    //przekierowanie na jakis adres po zapisaniu  
//         } catch (e) {
            
//         }
//     }

//     async getCSV (req, res) {
//         //pola, które chce mieć w CSV, trzeba je zamienić z JSON na CSV dzięki lib json2csv
//         // https://www.npmjs.com/package/json2csv
//         const fields = [
//             {
//                 label: 'Nazwa',
//                 value: 'name'
//             },
//             {
//                 label: 'URL',
//                 value: 'slug'
//             },
//             {
//                 label: 'Liczba pracowników',
//                 value: 'employeesCount'
//             },
//         ];

//         const data = await League.find(); //wszystkie pobrane firmy
//         const fileName = 'companies.csv'; //nazwa pliku

//         const json2csv = new Parser({ fields }); 
//         const csv = json2csv.parse(data); //parsujemy nasze dane do CSV

//         //express
//         res.header('Content-Type', 'text/csv'); //informujemy przeglądarke, że wysyłamy plik csv
//         res.attachment(fileName);
//         res.send(csv); //wysyłamy dane
//     }
// }

// module.exports = new LeagueController();