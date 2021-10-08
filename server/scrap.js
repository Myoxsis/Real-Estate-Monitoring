const axios = require("axios");
const cheerio = require("cheerio");
const { colors } = require("prompt");
const idx = require("./ScrapModel");
const ora = require('ora');
const prompt = require("prompt");

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//idx.resetDatabase();

async function scrapPAP() {
    var list_offers = [];

    for (var x = 1; x <= 20; x++) {
        const page_url = 'https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-courbevoie-92400-g43294-du-studio-au-5-pieces-' + x;
        const { data } = await axios.get(page_url);
        const $ = cheerio.load(data);

        $('div .search-list-item-alt').each((i, element) => {
            const $element = $(element);
            const offers = {};
            offers.name = $element.find($('span.h1')).text().replace(/\s\s+/g, ' ').trim();
            offers.link = ("https://www.pap.fr" + $element.find($('.item-title')).attr('href'));
            offers.company = "PAP";
            offers.location = $element.find($('span.h1')).text().replace(/\s\s+/g, ' ').trim();
            offers.function = $element.find($('ul.item-tags')).text().replace(/\s\s+/g, ' ').trim();
            offers.price = $element.find($('span.item-price')).text().replace(/\s\s+/g, ' ').trim();
            //offers.details = $element.find('ul.ts-offer-list-item__description').find('li').map((i, el) => {
            //    return $(el).text();
            //  }).get().join(' /*/ ').replace(/\s\s+/g, ' ').trim();
            offers.details = "";

            if ($element.find($('.item-title')).attr('href').startsWith('http') == false ) {
                list_offers.push(offers);
            }
        });

        //console.log(list_offers);

        //const spinner = ora('Scrapping PSA\n');
        //spinner.start();
        for (var i = 0; i < list_offers.length; i++) {
            try{
                console.log(list_offers[i].link);
                const { data } = await axios.get(list_offers[i].link);
                const $ = cheerio.load(data);

                list_offers[i].desc = $('div.margin-bottom-30 > div').text().replace(/\s\s+/g, ' ').trim();

                idx.add_to_db(list_offers[i]);
            } catch(e) {
                console.log(e.message);
            }
            console.log(list_offers[i]);
            sleep(getRandomInt(4,10)*1000);
        };
        //spinner.succeed();
        //console.log("Scrapped Total : " + list_offers.length);
    }
};

async function scrapPAPTest(city, mode) {
    var list_links = [];

    url_nantes_sell = "https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-nantes-44-g43619-du-studio-au-5-pieces-";
    url_nantes_rent = "https://www.pap.fr/annonce/location-appartement-maison-residence-avec-service-nantes-44-g43619-du-studio-au-5-pieces-";
    nb_pages_toscrap_nantes = 4; // 4
    url_courbevoie_sell = 'https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-courbevoie-92400-g43294-du-studio-au-5-pieces-';
    url_courbevoie_rent = 'https://www.pap.fr/annonce/location-appartement-maison-residence-avec-service-courbevoie-92400-g43294-du-studio-au-5-pieces-';
    nb_pages_toscrap_courbevoie = 20; // 30
    url_toulouse_sell = "https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-toulouse-31-g43612-du-studio-au-5-pieces-";
    url_toulouse_rent = "https://www.pap.fr/annonce/location-appartement-maison-residence-avec-service-toulouse-31-g43612-du-studio-au-5-pieces-"
    nb_pages_toscrap_toulouse = 10; // 10
    url_paris_sell = "https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-paris-75-g439-du-studio-au-5-pieces-";
    url_paris_rent = "https://www.pap.fr/annonce/location-appartement-maison-residence-avec-service-paris-75-g439-du-studio-au-5-pieces-"
    nb_pages_toscrap_paris = 25; // 25

    if(city == "courbevoie"){
        if(mode == 'sell') {
            city_to_scrap = url_courbevoie_sell;
        }
        else if(mode =='rent'){
            city_to_scrap = url_courbevoie_rent;
        }
        nb_pages_city = nb_pages_toscrap_courbevoie;
    }
    else if(city == "nantes"){
        if(mode == 'sell') {
            city_to_scrap = url_nantes_sell;
        }
        else if(mode =='rent'){
            city_to_scrap = url_nantes_rent;
        }
        nb_pages_city = nb_pages_toscrap_nantes;
    }
    else if(city == "toulouse"){
        if(mode == 'sell') {
            city_to_scrap = url_toulouse_sell;
        }
        else if(mode =='rent'){
            city_to_scrap = url_toulouse_rent;
        }
        nb_pages_city = nb_pages_toscrap_toulouse;
    }
    else if(city == "paris"){
        if(mode == 'sell') {
            city_to_scrap = url_paris_sell;
        }
        else if(mode =='rent'){
            city_to_scrap = url_paris_rent;
        }
        nb_pages_city = nb_pages_toscrap_paris;
    }

    for (var x = 1; x <= nb_pages_city; x++) {
        const page_url = city_to_scrap + x;
        const { data } = await axios.get(page_url);
        const $ = cheerio.load(data);

        $('div .search-list-item-alt').each((i, element) => {
            const $element = $(element);
            if ($element.find($('.item-title')).attr('href').startsWith('http') == false ) {
                list_links.push("https://www.pap.fr" + $element.find($('.item-title')).attr('href'));
            }
        });
        console.log('Scrapping Page ' + x);
        sleep(getRandomInt(4,10)*1000);
    }

    console.log("Number of Links : " + list_links.length);
    console.log(list_links);

    for (var i = 0; i < list_links.length; i++) {
        try{
            console.log(list_links[i]);
            const { data } = await axios.get(list_links[i]);
            const $ = cheerio.load(data);

            const offers = {};

            offers.title = $('h1.item-title').text().replace(/\s\s+/g, ' ').trim();
            if(mode == 'sell') {
                offers.type = 'sell';
            }
            else if(mode =='rent'){
                offers.type = 'rent';
            } 
            offers.link = list_links[i];
            offers.price = $('span.item-price').text().replace(/\s\s+/g, ' ').trim();
            offers.ref_n_date = $('p.item-date').text().replace(/\s\s+/g, ' ').trim();
            offers.city = $('h2.margin-bottom-8').text().replace(/\s\s+/g, ' ').trim();
            offers.tags = $('ul.item-tags.margin-bottom-20').text().replace(/\s\s+/g, ' ').trim();
            offers.free_text = $('div.margin-bottom-30').text().replace(/\s\s+/g, ' ').trim();
            offers.transport = $('ul.item_transports').text().replace(/\s\s+/g, ' ').trim();
            offers.raw_loc = $('div#carte_mappy').attr('data-mappy').replace(/\s\s+/g, ' ').trim();

            console.log(offers);
            idx.add_to_db(offers);
        } catch(e) {
            console.log(e.message);
        }
        sleep(getRandomInt(4,10)*1000);
    };
};

prompt.start();
prompt.get(['City', 'Mode'], function (err, result) {
    if (err) { return onErr(err); }
    else if (result.City.toLowerCase() == "toulouse") {
        console.log('  Scrapping Toulouse');
        if (result.Mode.toLowerCase() == "rent") {
            scrapPAPTest("toulouse", "rent");
        }
        else if (result.Mode.toLowerCase() == "sell") {
            scrapPAPTest("toulouse", "sell");
        }
        else {
            console.log('Please enter a valid selection (rent, sell)');
        }
        
    }
    else if (result.City.toLowerCase() == "nantes") {
        console.log('  Scrapping Nantes');
        if (result.Mode.toLowerCase() == "rent") {
            scrapPAPTest("nantes", "rent");
        }
        else if (result.Mode.toLowerCase() == "sell") {
            scrapPAPTest("nantes", "sell");
        }
        else {
            console.log('Please enter a valid selection (rent, sell)');
        }
    }
    else if (result.City.toLowerCase() == "courbevoie") {
        console.log('  Scrapping Courbevoie');
        if (result.Mode.toLowerCase() == "rent") {
            scrapPAPTest("courbevoie", "rent");
        }
        else if (result.Mode.toLowerCase() == "sell") {
            scrapPAPTest("courbevoie", "sell");
        }
        else {
            console.log('Please enter a valid selection (rent, sell)');
        }
    }
    else if (result.City.toLowerCase() == "paris") {
        console.log('  Scrapping Paris');
        if (result.Mode.toLowerCase() == "rent") {
            scrapPAPTest("paris", "rent");
        }
        else if (result.Mode.toLowerCase() == "sell") {
            scrapPAPTest("paris", "sell");
        }
        else {
            console.log('Please enter a valid selection (rent, sell)');
        }
    }
    else if (result.City.toLowerCase() == "all" && result.Mode.toLowerCase() == 'all') {
        console.log('  Scrapping All cities available');
        scrapPAPTest("paris", 'rent');
        scrapPAPTest("paris", 'sell');
        scrapPAPTest("courbevoie", 'rent');
        scrapPAPTest("courbevoie", 'sell');
        scrapPAPTest("nantes", 'rent');
        scrapPAPTest("nantes", 'sell');
        scrapPAPTest("toulouse", 'rent');
        scrapPAPTest("toulouse", 'sell');
    }
    else {
        console.log('  Please enter a valid city (Toulouse, Nantes, Courbevoie ou Paris)');
    }
});