const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Reserve = require("../models/reserve");
const Booked = require("../models/booked");
const { Parser } = require('json2csv');
const moment = require("moment/moment");
//const sequelize = require("sequelize");
const { sequelize } = require('../models');
const Excel = require('xlsx');
const { Op } = require('sequelize');


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

    if(!userid || !password){
        return res.status(400).send('유저 아이디와 비밀번호가 필요합니다.');
    }

    let transaction;
    try{
        transaction = await sequelize.transaction();
        const exUser = await User.findOne(({ where: { userid } } ), { transaction });
        if(exUser){
            await transaction.rollback();
            return res.status(409).send("이미 존재하는 유저입니다.");
        }
        await User.create({
            userid,
            password,
        }, { transaction });

        await transaction.commit();
        return res.status(200).send("유저가 성공적으로 추가되었습니다.");
    } catch (error){
        if (transaction) await transaction.rollback();
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
    let transaction;

    try {
        transaction = await sequelize.transaction();
        const adminCount = await User.count({
            where: { role: 'admin' }
        }, { transaction });
        const isAdmin = await User.count({
            where: {
                id: id,
                role: 'admin',
            }
        }, { transaction });

        if (adminCount <= 1 && isAdmin >= 1) {
            if (transaction) await transaction.rollback();
            return res.status(409).send('관리자 권한을 가진 사용자가 최소한 한 명 이상 존재해야 합니다.');
        }
        await Reserve.destroy({
            where : {
                UserId: id
            }
        }, { transaction });
        await User.destroy({
            where: {
                id: id
            }
        }, { transaction });
        await Booked.update(
            { cancel: 'cancel' },  // 변경할 속성
            { where: { UserId: id } },  // 수정할 레코드를 찾는 조건
            { transaction },
        );
        await transaction.commit();
        return res.send('사용자가 삭제되었습니다.');
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('사용자 삭제 중 오류 발생:', error);
        return res.status(500).send('서버 에러');
    }
}


//유저 정보 수정
exports.updateUser = async (req, res) => {
    const id = req.body.id;
    const newCompanyName = req.body.newCompanyName;

    const updateData = {  // 수정하려는 데이터
        userid: newCompanyName,
    };

    // 세션 정보가 없는 경우 처리
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }
    if(req.user.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    let transaction;
    try{
        transaction = await sequelize.transaction();
        const exUser = await User.count({
            where: {userid: newCompanyName}
        }, { transaction });
        if (exUser > 0){
            await transaction.rollback();
            return res.status(409).send("이미 존재하는 유저입니다.");
        }
        await User.update(updateData, {
            where: { id: id }
        }, { transaction });

        await transaction.commit();
        return res.status(200).send('유저 정보를 수정하였습니다.');
    }
    catch (error){
        if(transaction) await transaction.rollback();
        console.log(error)
    }

}

exports.updateUserPw = async (req, res) => {

    const id = req.body.id;
    const newCompanyPw = req.body.newCompanyPw;

    const updateData = {  // 수정하려는 데이터
        password: newCompanyPw,
    };

    // 세션 정보가 없는 경우 처리
    if(!req.user){
        return res.status(401).send('로그인이 필요합니다.');
    }
    if(req.user.role !== 'admin'){
        return res.status(403).send('권한이 없습니다.');
    }

    let transaction;
    try{
        transaction = await sequelize.transaction();
        await User.update(updateData, {
            where: { id: id }
        }, { transaction });
        await transaction.commit();
        return res.status(200).send('유저 정보를 수정하였습니다.');
    }
    catch (error){
        if(transaction) await transaction.rollback();
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
    const id = req.body.id;

    try {
        const userResArr = await Booked.findAll({
            include: [{
                model: User,
                attributes: ['id']
            }],
            where: {UserId: id},
            order: [['date', 'DESC'], ['startTime', 'DESC']]
        });

        // 데이터가 없을 경우 처리
        if (!userResArr || userResArr.length === 0) {
            return res.status(404).send('해당하는 예약 정보가 없습니다.');
        }

        const userResArrSet = userResArr.map(item => {
            return {
                회사명: item.nick,
                회의실: roomnames(item.roomValue),
                날짜: item.date,
                시작시간: item.startTime,
                종료시간: item.endTime,
                취소여부: item.cancel === 'cancel' ? '취소' : item.cancel,
            };
        });

        // JSON 데이터를 Excel 워크시트로 변환
        const worksheet = Excel.utils.json_to_sheet(userResArrSet);
        const workbook = Excel.utils.book_new();
        Excel.utils.book_append_sheet(workbook, worksheet, 'Reservations');

        // 버퍼로 Excel 파일 생성
        const excelBuffer = Excel.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // 응답 헤더 설정 및 파일 전송
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('reservations.xlsx');
        return res.send(excelBuffer);
    } catch (error) {
        console.log(error);
        res.status(500).send('서버에서 오류가 발생했습니다.');
    }
};


exports.infoWatch = async (req, res) => {
    const id = req.body.id;

    try {
        const userResArr = await Booked.findAll({
            include: [{
                model: User,
                attributes: ['id'] // User 모델에서 'id' 필드만 가져옵니다.
            }],
            where: {
                UserId: id, // 'UserId'는 Reserve 모델에서 User 모델을 참조하는 외래 키 필드명입니다.
            },
            order: [['date', 'DESC'], ['startTime', 'DESC']],
            limit: 100 // 결과 개수를 100개로 제한
        });

        const userResArrSet = userResArr.map(item => {
            return {
                id: item.ReserveId,
                name: item.nick,
                room: roomnames(item.roomValue),
                date: item.date,
                start: item.startTime,
                end: item.endTime,
                cancel: item.cancel,
            };
        });
        return res.send(userResArrSet);
    }
    catch (error) {
        console.log(error);
        res.status(500).send('서버에서 오류가 발생했습니다.');
    }
}


exports.getBookings = async (req, res) => {
    const room = req.body.room;
    const date = req.body.date;

    let condition = {}; // where 조건을 담을 객체 생성
    let limit; // 가져올 결과의 개수를 담을 변수 생성

    if (room) condition.roomValue = room; // room이 빈 문자열이 아니면 조건에 추가

    if (date) {
        condition.date = date;
    } else {
        limit = 100; // date가 빈 문자열이면 결과 개수를 100개로 제한
    }

    try {
        const adminResList = await Booked.findAll({
            where: condition, // 위에서 만든 조건 객체 사용
            order: [['date', 'DESC'], ['startTime', 'DESC']],
            limit // 위에서 설정한 limit 사용
        });

        const userResArrSet = adminResList.map(item => {
            return {
                id: item.ReserveId, // 고유 ID 추가
                name: item.nick,
                room: roomnames(item.roomValue),
                date: item.date,
                start: item.startTime,
                end: item.endTime,
                cancel: item.cancel === 'cancel' ? '취소' : item.cancel,
            };
        });
        return res.send(userResArrSet);
    }
    catch (error) {
        console.log(error);
    }
}

exports.downloadBookings = async (req, res) => {
    const room = req.body.room;
    const date = req.body.date;

    let condition = {};

    if (room) condition.roomValue = room;

    if (date) {
        condition.date = date;
    }

    try {
        const adminResList = await Booked.findAll({
            where: condition, // 위에서 만든 조건 객체 사용
            order: [['date', 'DESC'], ['startTime', 'DESC']],
        });

        const bookings = adminResList.map(item => {
            return {
                회사명: item.nick,
                회의실: roomnames(item.roomValue),
                날짜: item.date,
                시작시간: item.startTime,
                종료시간: item.endTime,
                취소여부: item.cancel,
            };
        });
        // JSON 데이터를 Excel 워크시트로 변환
        const worksheet = Excel.utils.json_to_sheet(bookings);
        const workbook = Excel.utils.book_new();
        Excel.utils.book_append_sheet(workbook, worksheet, 'Reservations');

        // 버퍼로 Excel 파일 생성
        const excelBuffer = Excel.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // 응답 헤더 설정 및 파일 전송
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('reservations.xlsx');
        return res.send(excelBuffer);
    }
    catch (error) {
        console.log(error);
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