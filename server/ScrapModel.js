const { Sequelize, Model, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize('postgres://maxime_alain:www.myoxsis.com@localhost:5432/real_estate_monitor', {logging: false});

//offer = {};

//
class Scrap extends Model {}
Scrap.init({
    title: { type: DataTypes.STRING, },
    type: { type: DataTypes.STRING, },
    link: { type: DataTypes.STRING, },
    price: { type: DataTypes.STRING, },
    ref_n_date: { type: DataTypes.STRING, },
    city: { type: DataTypes.STRING, },
    tags: { type: DataTypes.STRING, },
    free_text: { type: DataTypes.TEXT, allowNull : true},
    transport: { type: DataTypes.STRING, },
    raw_loc: { type: DataTypes.STRING, }
    }, {
    sequelize,
    timestamps: true,
    modelName: 'scrap',
});

function createScrap(x) {
    Scrap.create({ title : x.title, type : x.type, link : x.link, price : x.price, ref_n_date : x.ref_n_date,
         city : x.city, tags : x.tags, free_text : x.free_text, transport : x.transport, raw_loc : x.raw_loc,
    }).then( offer => {
    console.log("Offer Generate ID", offer.id);
    });
}

function isIdUnique (x) {
    return Scrap.count({ where: { title : x.title, type : x.type, link : x.link, price : x.price, ref_n_date : x.ref_n_date,
        city : x.city, tags : x.tags, free_text : x.free_text, transport : x.transport, raw_loc : x.raw_loc,  } })
      .then(count => {
        if (count != 0) {
          return false;
        }
        return true;
    });
}

function uniqueLink (x) {
    return Scrap.count({ where: { link : x } })
      .then(count => {
        if (count != 0) {
          return false;
        }
        return true;
    });
}

function add_to_db(x) {
    isIdUnique(x)
        .then(isUnique => {
            if (!isUnique) {
                console.log('Not Added : Already exists in database');
            }
            else {
                createScrap(x);
                console.log("Added to db");
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function resetDatabase() {
    Scrap.sync({ force: true });
}

function getDB() {
    const offers = Scrap.findAll({attributes: ['id', 'name', 'link', 'company'], order:[['id', 'DESC']]});
    return offers;
}

function getTodayOffers(day, now) {
    today_offer = Scrap.findAll({ where: { createdAt: { [Op.between]: [day, now] },}});
    return today_offer;
}

function getUpdateDateArray(day, now) {
    today_offer = Scrap.findAll({attributes: ['createdAt'], order:[['createdAt', 'DESC']]});
    return today_offer;
}


// the defined model is the class itself
console.log(Scrap === sequelize.models.scrap);

module.exports = { createScrap, isIdUnique, resetDatabase, add_to_db, getDB, getTodayOffers, getUpdateDateArray, uniqueLink };