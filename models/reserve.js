const Sequelize = require('sequelize');

class Reserve extends Sequelize.Model{
    static initiate(sequelize){
        Reserve.init({
            roomValue: {
                type: Sequelize.ENUM('seminar', 'meetRoom1', 'meetRoom2'),
                allowNull: false,
            },
            date: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: false,
            },
            startTime: {
                type: Sequelize.STRING(10),
                allowNull: false,
                unique: false,
            },
            endTime: {
                type: Sequelize.STRING(10),
                allowNull: false,
                unique: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Reserve',
            tableName: 'reserves',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Reserve.belongsTo(db.User);
    }
}

module.exports = Reserve;




