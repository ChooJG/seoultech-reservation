'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user', 'nick');
    await queryInterface.removeColumn('user', 'email');
    await queryInterface.removeColumn('user', 'tel');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'nick', {
      type: Sequelize.STRING
      // 여기에 필요한 추가 옵션을 넣으세요
    });
    await queryInterface.addColumn('user', 'email', {
      type: Sequelize.STRING
      // 여기에 필요한 추가 옵션을 넣으세요
    });
    await queryInterface.addColumn('user', 'tel', {
      type: Sequelize.STRING
      // 여기에 필요한 추가 옵션을 넣으세요
    });
  }
};