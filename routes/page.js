const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { renderJoin, renderMain, renderIndex } = require('../controllers/page');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

//router.get('/profile', isLoggedIn, renderProfile);

router.get('/join', isNotLoggedIn ,renderJoin);

router.get('/', (req, res, next) => {
    if (req.isAuthenticated()) { // 로그인 상태 확인
        return renderIndex(req, res, next); // 로그인한 경우
    }
    return renderMain(req, res, next); // 로그인하지 않은 경우
});


module.exports = router;