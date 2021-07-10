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

async function scrapPAPTest(city) {
    var list_links = [];

    url_nantes = "https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-nantes-44-g43619-du-studio-au-5-pieces-";
    nb_pages_toscrap_nantes = 4;
    url_courbevoie = 'https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-courbevoie-92400-g43294-du-studio-au-5-pieces-';
    nb_pages_toscrap_courbevoie = 20;
    url_toulouse = "https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-toulouse-31-g43612-du-studio-au-5-pieces-";
    nb_pages_toscrap_toulouse = 10;
    url_paris = "https://www.pap.fr/annonce/vente-appartement-immeuble-maison-residence-avec-service-paris-75-g439-du-studio-au-5-pieces-";
    nb_pages_toscrap_paris = 20;

    if(city == "courbevoie"){
        city_to_scrap = url_courbevoie;
        nb_pages_city = nb_pages_toscrap_courbevoie;
    }
    else if(city == "nantes"){
        city_to_scrap = url_nantes;
        nb_pages_city = nb_pages_toscrap_nantes;
    }
    else if(city == "toulouse"){
        city_to_scrap = url_toulouse;
        nb_pages_city = nb_pages_toscrap_toulouse;
    }
    else if(city == "paris"){
        city_to_scrap = url_paris;
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
prompt.get(['City'], function (err, result) {
    if (err) { return onErr(err); }
    else if (result.City.toLowerCase() == "toulouse") {
        console.log('  Scrapping Toulouse');
        scrapPAPTest("toulouse");
    }
    else if (result.City.toLowerCase() == "nantes") {
        console.log('  Scrapping Nantes');
        scrapPAPTest("nantes");
    }
    else if (result.City.toLowerCase() == "courbevoie") {
        console.log('  Scrapping Courbevoie');
        scrapPAPTest("courbevoie");
    }
    else {
        console.log('  Please enter a valid city (Toulouse, Nantes, Courbevoie)');
    }
});