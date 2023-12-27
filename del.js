const Sequelize = require('sequelize');
const sequelize = new Sequelize('database_development', 'root', 'tiger', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.query('DROP DATABASE IF EXISTS seoultech_reserve')
    .then(() => console.log('데이터베이스가 삭제되었습니다.'))
    .catch(err => console.log('Error: ' + err));