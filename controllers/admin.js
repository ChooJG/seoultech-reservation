const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Reserve = require("../models/reserve");
const { Parser } = require('json2csv');
const moment = require("moment/moment");


exports.join = async (req, res, next) => {

    // 세션 정보가 없는 경우 처리
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }

    if(req.user.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    const { userid, password } = req.body;
    try{
        const exUser = await User.findOne(({ where: { userid } } ));
        if(exUser){
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            userid,
            password: hash,
        });
        return res.redirect('/');
    } catch (error){
        console.log(error);
        return next(error);
    }
}


//유저 삭제
exports.deleteUser = async (req, res) => {
    const userid = req.body.userid;

    // 세션 정보가 없는 경우 처리
    if(!req.session.userinfo){
        return res.status(401).send('로그인이 필요합니다.');
    }

    if(req.session.userinfo.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    try {
        await User.destroy({
            where: {
                userid: userid
            }
        });
        res.send('사용자가 삭제되었습니다.');
    } catch (error) {
        console.error('사용자 삭제 중 오류 발생:', error);
        res.status(500).send('서버 에러');
    }
}


//유저 정보 수정



//모든 유저 정보 보기
exports.showUsers = async (req, res) => {
    // 세션 정보가 없는 경우 처리
    if(!req.user){
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


exports.infoDown = async (req, res) => {
    //const userid = req.body.userid;
    const userid = req.user.userid;

    try{
        const user = await User.findOne({ where: { userid: userid } });
        const id = user ? user.id : null;

        const userResArr = await Reserve.findAll({
            include: [{
                model: User,
                attributes: ['id'] // User 모델에서 'id' 필드만 가져옵니다.
            }],
            where: {UserId: id}, // 'UserId'는 Reserve 모델에서 User 모델을 참조하는 외래 키 필드명입니다.
            order: [['date', 'DESC'], ['startTime', 'DESC']]
        });

        const userResArrSet = userResArr.map(item => {

            return {
                room: item.roomValue,
                date: item.date,
                start: item.startTime,
                end: item.endTime,
            };
        });

        const jsonReservations = JSON.parse(JSON.stringify(userResArrSet));
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(jsonReservations);

        const csv_name = userid + '_reservations.csv'
        res.header('Content-Type', 'text/csv');
        res.attachment(csv_name);
        return res.send(csv);
    }
    catch (error){
        console.log(error);
        res.status(500).send('서버에서 오류가 발생했습니다.');
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
        case 'meetroom1':
            return '소회의실1';
        case 'meetroom2':
            return '소회의실2';
    }
    return '';
}