//exports.renderProfile = (res, req) => {
//    res.render('profile', { title: 'seoultech'});
//};

exports.renderJoin = (req, res) => {
    res.render('join', { title: 'join' });
};

exports.renderMain = (req, res, next) => {
    res.render('main', {
        title: 'seoultech',
    });

};

exports.renderIndex = (req, res, next) => {
    res.render('index', {
        title: 'seoultech',
        user: req.user,
    });
};