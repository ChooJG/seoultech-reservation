const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout, isLogin } = require('../controllers/auth');
const { selectRoom, selectTime, resDate, getUserRes, deleteRes }
    = require('../controllers/reserve');

const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

router.get('/logout', logout);

router.get('/isLogin', isLogin);

//예약 room마다 라우터 설정 필요d
router.get('/isLogin/1', isLogin);
router.get('/isLogin/2', isLogin);
router.get('/isLogin/3', isLogin);

//로그인 후 예약 과정
router.get('/selectRoom', isLoggedIn, selectRoom);

router.post('/selectTime', isLoggedIn, selectTime);

router.post('/resDate', resDate);

router.get('/getUserRes', getUserRes);

router.post('/deleteRes', deleteRes);

module.exports = router;