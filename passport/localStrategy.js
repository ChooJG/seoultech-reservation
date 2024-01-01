const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'userid',
        passwordField: 'password',
        passReqToCallback: false,
    }, async (userid, password, done) => {
        try {
            const exUser = await User.findOne({ where: { userid } });
            if (exUser) {
                if (password === exUser.password){
                    done(null, exUser);
                }
                else{
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            }
            else {
                done(null, false, { message: '아이디가 존재하지 않습니다.' });
            }
        }
        catch (error) {
            console.error(error);
            done(error);
        }
    }));
};