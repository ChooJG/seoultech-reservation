const Sequelize = require('sequelize');
const User = require('./user');
const Reserve = require('./reserve');
const Booked = require('./booked');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const db = {}
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Reserve = Reserve;
db.Booked = Booked;

User.initiate(sequelize);
Reserve.initiate(sequelize);
Booked.initiate(sequelize);

User.associate(db);
Reserve.associate(db);
Booked.associate(db);

module.exports = db;