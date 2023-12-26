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
    const date = req.body.date;
    const time = req.body.time;
    const userId = req.body.userId;
    const room = req.body.roomValue;

    console.log("==================================")
    console.log("date : ", date)
    console.log("time : ", time)
    console.log("userid : ", userId)
    console.log("roomValue : ", room)

    try{
        const exRes = await Reserve.findOne(({ where: {
                date,
                time,
                room,
            } } ));
        if(exRes){
            return res.redirect('/?error=exist');
        }

        await Reserve.create({
            room,
            date,
            time,
            userId,
        });
        res.redirect('/?success=true');
    }
    catch (error){
        console.log(error);
        return next(error);
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