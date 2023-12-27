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
    const userId = req.session.userInfo.userid;
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

    console.log("==================================")
    console.log("date : ", date)
    console.log("startTime : ", startTime)
    console.log("endTime : ", endTime)
    console.log("userid : ", userId)
    console.log("roomValue : ", roomValue)

    try{
        const exRes = await Reserve.findOne(({ where: {
                date,
                startTime,
                endTime,
                roomValue,
            } } ));
        if(exRes){
            res.json({ success: false, message: '예약이 이미 존재합니다.' });
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
        res.status(500).json({ success: false, message: '서버에서 오류가 발생했습니다.' });
    }
}


exports.resDate = async (req, res) => {
    const date = req.query.date;
    const room = req.query.roomValue;

    const reservations
        = await Reserve.findAll({ where: {date: date, room: room} });

    //예약 없으면 빈문자열 전송
    if (reservations.length === 0) {
        res.send('');
    } else {
        res.json(reservations);
    }
}