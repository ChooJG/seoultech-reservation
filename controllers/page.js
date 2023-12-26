//exports.renderProfile = (res, req) => {
//    res.render('profile', { title: 'seoultech'});
//};

exports.renderJoin = (req, res) => {
    res.render('join', { title: 'join' });
};

exports.renderMain = (req, res, next) => {
    //res.render('main', {
    //    title: 'seoultech',
    //});
    const { id, pw } = req.body;

    if(id === "123" && pw === "123"){
        res.status(200).json({ message: '로그인 성공' });
    } else {
        res.status(401).json({ message: '아이디 또는 비밀번호가 틀림' });
    }
};

exports.renderIndex = (req, res, next) => {
    res.render('index', {
        title: 'seoultech',
        user: req.user,
    });
};