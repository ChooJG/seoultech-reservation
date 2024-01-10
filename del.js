const Sequelize = require('sequelize');
const { User, Reserve, Booked } = require('./models'); // 'models'는 실제 모델이 위치한 경로로 변경해주세요.


// User.findAll()
//     .then(users => {
//         console.log(users);
//     })
//     .catch(error => {
//         console.log("데이터를 불러오는데 실패했습니다: ", error);
//     });


// User.destroy({
//     where: {},
// })
//     .then(() => {
//         console.log("모든 사용자 데이터가 삭제되었습니다.");
//     })
//     .catch(error => {
//         console.log("데이터를 삭제하는데 실패했습니다: ", error);
//     });



// User.create({
//     userid: 'admin6672',
//     password: 'admin6672',
//     role: 'admin',
// })
//     .then(newUser => {
//         console.log("새로운 사용자가 추가되었습니다: ", newUser);
//     })
//     .catch(error => {
//         console.log("데이터를 추가하는데 실패했습니다: ", error);
//     });

//console.log(Object.keys(Booked.rawAttributes));

// const recreateTable = async () => {
//     try {
//         // 테이블을 삭제합니다.
//         await Booked.drop();
//         await Reserve.drop();
//         await User.drop();
//         console.log("테이블이 성공적으로 삭제되었습니다.");
//
//         // 테이블을 다시 생성합니다.
//         await User.sync();
//         await Reserve.sync();
//         await Booked.sync();
//         console.log("테이블이 성공적으로 생성되었습니다.");
//     } catch (error) {
//         console.error("테이블 재생성 중 오류가 발생했습니다: ", error);
//     }
// };
//
// recreateTable();


