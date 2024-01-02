const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

//유저 회원가입
exports.join = async (req, res, next) => {
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



exports.login = (req, res, next) => {
    console.log("로그인중");
    console.log("id : ", req.body.userid);
    passport.authenticate('local', (authError, user, info) => {
        if (authError){
            console.error(authError);
            return res.status(500).json({success: false, error: authError,
                message: "서버에서 오류가 발생하였습니다. 잠시 후 시도해주세요"});
        }
        if (!user){
            return res.status(401).json({success: false, error: 'Login failed',
                message: "아이디, 또는 비밀번호가 잘못되었습니다."});
        }
        return req.login(user, (loginError) => {
            if (loginError){
                console.error(loginError);
                return res.status(500).json({error: loginError,
                    message: "서버에서 오류가 발생하였습니다. 잠시 후 시도해주세요"});
            }
            req.session.userInfo = {
                role: user.role,
                userid: user.userid,
            };
            console.log("vvvvvvvvvvvvvvvvvvvvvv");
            console.log(req.user.userid)
            return res.status(200).json({success: true, message: 'Login successful'});
        });
    })(req, res, next);
};



exports.logout = (req, res) => {
    req.session.destroy(function(err) {
        if (err) {
            console.error('세션 무효화 중 오류 발생:', err);
            res.send({ success: false });
        } else {
            res.clearCookie('connect.sid', { path: '/' }); // 쿠키 지우기
            res.send({ success: true });
        }
    });
};


exports.isLogin = (req, res)=> {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    console.log("로그인한 유저 : ", req.user);
    if (req.session && (req.session.userInfo || req.user)) {
        res.json({
            isAuthenticated: true,
            userinfo: req.user,
            userid: req.user.userid, // 사용자 정보 반환
            role: req.user.role || req.session.userInfo.role,
        });
    } else {
        res.json({
            isAuthenticated: false,
        });
    }
}