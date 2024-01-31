const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, deleteUser, showUsers, infoDown, updateUser, updateUserPw,
    infoWatch, getBookings, downloadBookings }
    = require('../controllers/admin');

const router = express.Router();

router.post('/join', join);

router.post('/deleteUser', deleteUser);

router.get('/showUsers', showUsers);

router.post('/infoDown', infoDown);

router.post('/updateUser', updateUser);

router.post('/updateUserPw', updateUserPw);

router.post('/infoWatch', infoWatch);

router.post('/getBookings', getBookings);

router.post('/downloadBookings', downloadBookings)

module.exports = router;