const Sequelize = require('sequelize');

class User extends Sequelize.Model{
    static initiate(sequelize){
        User.init({
            userid: {
                type: Sequelize.STRING(20),
                allowNull: false, //null허용 안함
                unique: true, //unique해야 함
            },
            password: {
                type: Sequelize.STRING(70),
                allowNull: false,
                unique: false,
            },
            role: {
                type: Sequelize.ENUM('guest', 'user', 'admin'),
                defaultValue: 'user', // 기본값 설정,
            },
            provider: {
                type: Sequelize.ENUM('local'),
                allowNull: false,
                defaultValue: 'local',
            },
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.User.hasMany(db.Reserve);
    }
}

module.exports = User;



