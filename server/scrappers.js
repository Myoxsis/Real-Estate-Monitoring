const axios = require("axios");
const cheerio = require("cheerio");
const idx = require("./OfferModel");
const ora = require('ora');

/* 
Add ArianeGroup Scrap // Not Working yet (Workday)
Add Daher Scrap // Worrkday so not working yet
Add Sodern scrap not working yet // Smartrecruiters

Working :
Alstom : ok
 */

async function scrapRichemont() {
    const page_url = 'https://jobs.richemont.com/search/?createNewAlert=false&q=&locationsearch=&optionsFacetsDD_facility=&optionsFacetsDD_country=FR&optionsFacetsDD_department=&optionsFacetsDD_shifttype=&optionsFacetsDD_customfield5=&optionsFacetsDD_customfield4='
    const { data } = await axios.get(page_url);
    const $ = cheerio.load(data);
    var list_offers = [];

    $('#searchresults tbody tr').each((i, element) => {
        const $element = $(element);
        const offers = {};
        offers.name = $element.find($('.jobTitle')).text().replace(/\s\s+/g, ' ').trim();
        offers.link = ("https://jobs.richemont.com" + $element.find($('.jobTitle')).find('a').attr('href'));
        offers.company = $element.find($('.colFacility')).text().replace(/\s\s+/g, ' ').trim();
        offers.function = $element.find($('.colDepartment')).text().replace(/\s\s+/g, ' ').trim();
        offers.details = $element.find($('.colLocation')).text().replace(/\s\s+/g, ' ').trim();

        list_offers.push(offers);
    });
    const spinner = ora('Scrapping Richemont\n');
    spinner.start();
    for (var i = 0; i < list_offers.length; i++) {
        try{
            const { data } = await axios.get(list_offers[i].link);
            const html = cheerio.load(data);
            list_offers[i].desc = html('.job').text().replace(/\s\s+/g, ' ').trim();
            idx.add_to_db(list_offers[i]);
        } catch(e) {
            console.log(e.message);
        }
    };
    spinner.succeed();
};




//idx.resetDatabase();
function scrapAll() {
    scrapRichemont();
};


module.exports = {scrapAll};