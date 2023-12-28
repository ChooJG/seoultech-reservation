const Reserve = require('../models/reserve');
const User = require("../models/user");


exports.selectRoom = async (req, res, next) => {
    const roomName = req.query.roomName;
    const roomValue = req.query.roomValue;

    //방 예약 정보 불러오기
    const roomReservations =
        await Reserve.findAll({ where: { room: roomValue } });

    console.log('roomName:', roomName);
    console.log('roomValue:', roomValue);

    res.render('selectTime', {
        title: 'seoultech',
        roomName: roomName,      // roomName을 템플릿에 전달
        roomValue: roomValue,   // roomValue를 템플릿에 전달
        user: req.user,
        reservations: roomReservations,
    });
}


//시간대 선택 후 겹치는거 없으면 예약 진행
exports.selectTime = async (req, res, next) => {
    const date = req.body.resDate;
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    const roomName = req.body.roomName;
    let roomValue = '';

    switch (roomName){
        case '세미나실':
            roomValue = 'seminar';
            break;
        case '소회의실1':
            roomValue = 'meetRoom1';
            break;
        case '소회의실2':
            roomValue = 'meetRoom2';
            break;
    }

    try{
        if (!req.session.userinfo) {
            res.status(401).send('로그인이 필요합니다.');
            return;
        }
        const userId = req.session.userInfo.userid;
        const { Op } = require("sequelize");

        const exRes = await Reserve.findOne({
            where: {
                date,
                roomValue,
                [Op.or]: [
                    {
                        startTime: {
                            [Op.lte]: startTime, // 시작 시간이 DB의 시작 시간보다 같거나 늦을 경우
                        },
                        endTime: {
                            [Op.gt]: startTime, // 끝나는 시간이 DB의 시작 시간보다 빠를 경우
                        },
                    },
                    {
                        startTime: {
                            [Op.lt]: endTime, // 시작 시간이 DB의 끝나는 시간보다 빠를 경우
                        },
                        endTime: {
                            [Op.gte]: endTime, // 끝나는 시간이 DB의 끝나는 시간보다 같거나 늦을 경우
                        },
                    },
                    {
                        startTime: {
                            [Op.gte]: startTime, // 시작 시간이 새로운 시작 시간보다 늦거나 같은 경우
                        },
                        endTime: {
                            [Op.lte]: endTime, // 종료 시간이 새로운 종료 시간보다 이른 경우
                        },
                    },
                ],
            },
        });


        if (exRes) {
            return res.json({ success: false, message: "예약이 이미 존재합니다." });
        }

        await Reserve.create({
            roomValue,
            date,
            startTime,
            endTime,
            userId,
        });
        res.json({ success: true, message: '예약이 성공적으로 완료되었습니다.' });
    }
    catch (error){
        console.log(error);
        res.status(500).json({ success: false, message: '서버에서 오류가 발생했습니다. 잠시 후에 시도해주세요.' });
    }
}

//회의실, 날짜 선택했을 때 이미 예약된 정보 뽑아줌
exports.resDate = async (req, res) => {
    try {
        const date = req.query.date;
        const roomValue = req.query.roomValue;

        if (!date || !roomValue) {
            res.status(400).send('필요한 쿼리 파라미터가 누락되었습니다.');
            return;
        }

        const reservations
            = await Reserve.findAll({
            where: {date: date, roomValue: roomValue} });

        // 예약 없으면 빈 문자열 전송
        if (reservations.length === 0) {
            res.send('');
        } else {
            res.json(reservations);
        }
    } catch (error) {
        console.error('예약 조회 중 오류 발생:', error);
        res.status(500).send('서버 에러');
    }
}


/////////////////////////////////////////////////
//라우터도 만들어야 함

//개인 예약 내역 뽑아보기
exports.getUserRes = async (req, res) => {
    try {
        if (!req.session.userinfo) {
            res.status(401).send('로그인이 필요합니다.');
            return;
        }

        const userid = req.session.userinfo.userid;
        const userResArr =
            await Reserve.findAll({
                where: {userid: userid},
                order: [['startTime', 'DESC']]
            });

        if (userResArr.length === 0) {
            res.send('');
        } else {
            res.json(userResArr);
        }
    } catch (error) {
        console.error('예약 내역 조회 중 오류 발생:', error);
        res.status(500).send('서버 에러');
    }
}


//관리자 권한
//모든 유저 정보 보기
exports.showUsers = async (req, res) => {
    // 세션 정보가 없는 경우 처리
    if(!req.session.userinfo){
        return res.status(401).send('로그인이 필요합니다.');
    }

    if(req.session.userinfo.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    try {
        const usersInfo = await User.findAll();
        if (usersInfo.length === 0) {
            res.send('');
        } else {
            res.json(usersInfo);
        }
    } catch (error) {
        // User.findAll에서 에러가 발생한 경우 처리
        console.error(error);
        res.status(500).send('서버에서 오류가 발생했습니다.');
    }
}
