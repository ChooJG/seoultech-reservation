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
    passport.authenticate('local', (authError, user, info) => {
        if (authError){
            console.error(authError);
            return next(authError);
        }
        if (!user){
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError){
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
};


exports.logout = (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
};