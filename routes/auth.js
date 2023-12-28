const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout, isLogin } = require('../controllers/auth');
const { selectRoom, selectTime, resDate } = require('../controllers/reserve');

const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

router.get('/logout', isLoggedIn, logout);

router.get('/isLogin', isLogin);

//로그인 후 예약 과정
router.get('/selectRoom', isLoggedIn, selectRoom);

router.post('/selectTime', isLoggedIn, selectTime);

router.get('/resDate', isLoggedIn, resDate);

module.exports = router;