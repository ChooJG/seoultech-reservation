const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, deleteUser, showUsers, infoDown } = require('../controllers/admin');

const router = express.Router();

router.post('/join', join);

router.post('/deleteUser', deleteUser);

router.get('/showUsers', showUsers);

router.post('/infoDown', infoDown);

module.exports = router;