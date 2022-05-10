require('dotenv').config()

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,   
  pool: {
    max: parseInt(process.env.DB_POOL_MAX),
    min: parseInt(process.env.DB_POOL_MIN),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE),
    idle: parseInt(process.env.DB_POOL_IDLE)
    }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.ShortURL = require('./ShortURL.js')(sequelize, Sequelize);
db.CustomCode = require('./CustomCode.js')(sequelize, Sequelize);

module.exports = db;