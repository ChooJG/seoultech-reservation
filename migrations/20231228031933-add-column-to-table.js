module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 'reserves' 테이블에 'startTime' 컬럼 추가
    await queryInterface.addColumn('reserves', 'startTime', {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: false,
    });
    // 'reserves' 테이블에 'endTime' 컬럼 추가
    await queryInterface.addColumn('reserves', 'endTime', {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: false,
    });
    // 'reserves' 테이블의 'room' 컬럼명을 'roomValue'로 변경
    await queryInterface.renameColumn('reserves', 'room', 'roomValue');
    // 'reserves' 테이블의 'time' 컬럼 삭제
    await queryInterface.removeColumn('reserves', 'time');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('reserves', 'startTime');
    await queryInterface.removeColumn('reserves', 'endTime');
    await queryInterface.renameColumn('reserves', 'roomValue', 'room');
    // 'time' 컬럼을 복원하기 위해선 해당 컬럼의 원래 설정을 알아야 합니다.
    // 아래의 코드는 예시이므로, 실제 'time' 컬럼의 설정에 맞게 수정해야 합니다.
    await queryInterface.addColumn('reserves', 'time', {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: false,
    });
  }
};
