const Sequelize = require('sequelize');

class Booked extends Sequelize.Model{
    static initiate(sequelize){
        Booked.init({
            nick:{
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            roomValue: {
                type: Sequelize.ENUM('seminar', 'meetRoom1', 'meetRoom2', 'whole'),
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
            cancel: {
                type: Sequelize.ENUM('', 'cancel'),
                allowNull: false,
                defaultValue: '',
            },
            ReserveId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Booked',
            tableName: 'bookeds',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Booked.belongsTo(db.User);
    }
}

module.exports = Booked;