const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');


exports.join = async (req, res, next) => {
    const { userid, nick, password, email, tel } = req.body;
    try{
        const exUser = await User.findOne(({ where: { userid } } ));
        if(exUser){
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            userid,
            nick,
            password: hash,
            email,
            tel,
        });
        return res.redirect('/');
    } catch (error){
        console.log(error);
        return next(error);
    }
}


exports.login = (req, res, next) => {
    console.log("로그인중....")
    console.log("세션 ID:", req.sessionID);
    passport.authenticate('local', (authError, user, info) => {
        if (authError){
            console.error(authError);
            return res.status(500).json({error: authError});
        }
        if (!user){
            return res.status(401).json({error: 'Login failed', message: info.message});
        }
        return req.login(user, (loginError) => {
            if (loginError){
                console.error(loginError);
                return res.status(500).json({error: loginError});
            }
            req.session.userInfo = {
                role: user.role,
                userid: user.userid,
            };
            console.log("================");
            console.log("user : ", req.session.userInfo);
            return res.status(200).json({success: true, message: 'Login successful'});
        });
    })(req, res, next);
};



exports.logout = (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
};


exports.isLogin = (req, res)=> {
    console.log("=================");
    console.log("로그인함?", req.session.userInfo);
    if (req.session && (req.session.userInfo || req.user)) {
        res.json({
            isAuthenticated: true,
            userinfo: req.session.userInfo,
            userid: req.session.userInfo.userid, // 사용자 정보 반환
            role: req.session.userInfo.role,
        });
    } else {
        res.json({
            isAuthenticated: false,
        });
    }
}