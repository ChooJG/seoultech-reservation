const Reserve = require('../models/reserve');
const User = require("../models/user");
const Booked = require('../models/booked');
const moment = require('moment');
require('moment-timezone');


exports.selectRoom = async (req, res, next) => {
    const roomName = req.query.roomName;
    const roomValue = req.query.roomValue;

    //방 예약 정보 불러오기
    const roomReservations =
        await Reserve.findAll({ where: { room: roomValue } });

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
        if (!req.user) {
            res.status(401).send('로그인이 필요합니다.');
            return;
        }
        const UserId = req.user.id;
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

        const newReserve = await Reserve.create({
            roomValue,
            date,
            startTime,
            endTime,
            UserId,
        });
        // 생성된 레코드의 ID를 얻습니다.
        const ReserveId = newReserve.id;
        await Booked.create({
            nick: req.user.userid,
            roomValue,
            date,
            startTime,
            endTime,
            UserId,
            ReserveId,
        })
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
        const date = req.body.date;
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
            const timesArray = []
            reservations.forEach(reservation => {
                // Assuming each reservation has startTime and endTime
                const slots = generateTimeSlots(reservation.startTime, reservation.endTime);
                timesArray.push(...slots);
            });
            res.json(timesArray);
        }
    } catch (error) {
        console.error('예약 조회 중 오류 발생:', error);
        res.status(500).send('서버 에러');
    }
}

function generateTimeSlots(startTime, endTime) {
    let timeSlots = [];
    let start = moment(startTime, 'HH:mm');
    let end = moment(endTime, 'HH:mm');

    while (start <= end) {
        timeSlots.push(start.format('HH:mm'));
        start.add(30, 'minutes');
    }

    return timeSlots;
}

//개인 예약 내역 뽑아보기
exports.getUserRes = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).send('로그인이 필요합니다.');
            return;
        }

        const id = req.user.id;
        const userResArr = await Reserve.findAll({
            include: [{
                model: User,
                attributes: ['id'] // User 모델에서 'id'필드만 가져옵니다.
            }],
            where: {UserId: id}, // 'UserId'는 Reserve 모델에서 User 모델을 참조하는 외래 키 필드명입니다.
            order: [['startTime', 'DESC']]
        });

        const formatResArr = userResArr.map(item => {
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // 시간 단위로 변환

            return {
                id: item.id,
                date: formatDateWithDay(item.date),
                room: roomnames(item.roomValue),
                time: formatTimeRange(item.startTime, item.endTime),
                confirmed: item.confirmed
            };
        });

        if (formatResArr.length === 0) {
            res.send('');
        } else {
            res.json(formatResArr);
        }
    } catch (error) {
        console.error('예약 내역 조회 중 오류 발생:', error);
        res.status(500).send('서버 에러');
    }
}


function formatDateWithDay(dateStr) {
    // 한국 시간대 설정
    moment.tz.setDefault("Asia/Seoul");

    // 한국어 설정
    require('moment/locale/ko');
    moment.locale('ko');

    // 날짜 포맷 변경
    return moment(dateStr).format('YYYY. MM. DD (dd)');
}

function roomnames(room){
    switch (room){
        case 'seminar':
            return '세미나실';
        case 'meetRoom1':
            return '소회의실1';
        case 'meetRoom2':
            return '소회의실2';
    }
    return '';
}

function formatTimeRange(startTime, endTime) {
    // startTime과 endTime을 moment 객체로 변환
    const start = moment(startTime, "HH:mm");
    const end = moment(endTime, "HH:mm");

    // 차이 계산
    const duration = moment.duration(end.diff(start));

    // 시간과 분으로 변환
    const hours = duration.hours();
    const minutes = duration.minutes();

    // 결과 문자열 포맷팅
    return `${startTime} - ${endTime} (${hours}시간 ${minutes}분)`;
}

//예약 내역 삭제
exports.deleteRes = async (req, res) => {
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }

    const resId = req.body.id;
    if(!resId){
        return res.status(400).send('필요한 쿼리 파라미터가 누락되었습니다.');
    }

    try {
        const reserves = await Reserve.findAll({
            where: {
                id: resId
            }
        });

        if (reserves.length === 0) {
            return res.status(200).json([]); // 배열의 길이가 0이면 빈 배열을 반환합니다.
        }

        await Reserve.destroy({
            where: {
                id: resId
            }
        });
        await Booked.update(
            { cancel: 'cancel' },  // 변경할 속성
            { where: { ReserveId: resId } }  // 수정할 레코드를 찾는 조건
        );

        res.status(200).json({ message: true });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error}` });  // 에러가 발생하면 500 에러와 함께 에러 메시지를 반환합니다.
    }
}


