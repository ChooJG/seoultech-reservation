const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Reserve = require("../models/reserve");
const Booked = require("../models/booked");
const { Parser } = require('json2csv');
const moment = require("moment/moment");
const sequelize = require("sequelize");


exports.join = async (req, res, next) => {

    // 세션 정보가 없는 경우 처리
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }
    if(req.user.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    const userid = req.body.newUser;
    const password = req.body.newUserPw;

    try{
        const exUser = await User.findOne(({ where: { userid } } ));
        if(exUser){
            return res.status(409).send("이미 존재하는 유저입니다.");
        }
        await User.create({
            userid,
            password,
        });
        return res.status(200).send("유저가 성공적으로 추가되었습니다.");
    } catch (error){
        console.log(error);
        return next(error);
    }
}


//유저 삭제
exports.deleteUser = async (req, res) => {
    const id = req.body.id;

    // 세션 정보가 없는 경우 처리
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }

    if(req.user.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    try {
        const adminCount = await User.count({
            where: { role: 'admin' }
        });
        const isAdmin = await User.count({
            where: {
                id: id,
                role: 'admin',
            }
        })

        if (adminCount <= 1 && isAdmin >= 1) {
            return res.status(409).send('관리자 권한을 가진 사용자가 최소한 한 명 이상 존재해야 합니다.');
        }
        await Reserve.destroy({
            where : {
                UserId: id
            }
        });
        await User.destroy({
            where: {
                id: id
            }
        });
        return res.send('사용자가 삭제되었습니다.');
    } catch (error) {
        console.error('사용자 삭제 중 오류 발생:', error);
        return res.status(500).send('서버 에러');
    }
}


//유저 정보 수정
exports.updateUser = async (req, res) => {
    const id = req.body.id;
    const newCompanyName = req.body.newCompanyName;
    const newPassword = req.body.newPassword;

    const updateData = {  // 수정하려는 데이터
        userid: newCompanyName,
        password: newPassword
    };

    console.log("새로운 회사와 비밀번호")
    console.log(updateData);

    // 세션 정보가 없는 경우 처리
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }
    if(req.user.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }
    try{
        const exUser = await User.count({
            where: {userid: newCompanyName}
        });
        if (exUser > 0){
            console.log("dddddddddddddddddddddddddddddddd")
            return res.status(409).send("이미 존재하는 유저입니다.");
        }
        await User.update(updateData, {
            where: { id: id }
        });
        return res.status(200).send('유저 정보를 수정하였습니다.');
    }
    catch (error){
        console.log(error)
    }

}



//모든 유저 정보 보기
exports.showUsers = async (req, res) => {
    // 세션 정보가 없는 경우 처리
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }

    if(req.user.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    try {
        const usersInfo = await User.findAll({
            order: [
                sequelize.literal(`(CASE WHEN role = 'admin' THEN 1 ELSE 2 END)`)
            ]
        });
        if (usersInfo.length === 0) {
            return res.send('');
        } else {
            const formatUsersInfo = usersInfo.map(item => {

                return {
                    id: item.id,
                    companyName: item.userid,
                    password: item.password,
                };
            });
            return res.send(formatUsersInfo);
        }
    } catch (error) {
        // User.findAll에서 에러가 발생한 경우 처리
        console.error(error);
        res.status(500).send('서버에서 오류가 발생했습니다.');
    }
}


exports.infoDown = async (req, res) => {
    //const userid = req.body.userid;
    const id = req.body.id;

    try{
        // const user = await User.findOne({ where: { id: id } });
        // const id = user ? user.id : null;

        const userResArr = await Booked.findAll({
            include: [{
                model: User,
                attributes: ['id'] // User 모델에서 'id' 필드만 가져옵니다.
            }],
            where: {UserId: id}, // 'UserId'는 Reserve 모델에서 User 모델을 참조하는 외래 키 필드명입니다.
            order: [['date', 'DESC'], ['startTime', 'DESC']]
        });

        const userResArrSet = userResArr.map(item => {

            return {
                name: item.nick,
                room: item.roomValue,
                date: item.date,
                start: item.startTime,
                end: item.endTime,
            };
        });

        const jsonReservations = JSON.parse(JSON.stringify(userResArrSet));
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(jsonReservations);

        res.header('Content-Type', 'text/csv');
        res.attachment('reservations.csv');
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