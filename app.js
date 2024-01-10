const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');



dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const { sequelize } = require('./models');
const passportConfig =require('./passport');



const app = express();
passportConfig();
app.set('port', process.env.PORT || 3001);
//app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
// sequelize.sync({ force: false })
//     .then(() => {
//       console.log("데이터베이스 연결 성공");
//     })
//     .catch((err) => {
//       console.error(err);
//     });

sequelize
    .sync({ force: false })
    .then(() => {
      console.log("데이터베이스 연결 성공");
      return sequelize.query("SHOW VARIABLES LIKE 'version';");
    })
    .then(([results, metadata]) => {
      console.log('MySQL version : ', results[0].Value);
    })
    .catch((err) => {
      console.error(err);
    });

if(process.env.NODE_ENV === 'production'){
  app.use(morgan('combined'));
}
else{
  app.use(morgan('dev'));
}

// var cors = require('cors');
// app.use(cors({
//   origin: 'http://localhost:3000', // 클라이언트의 주소
//   credentials: true
// }));
app.use(express.static(path.join(__dirname, './build')));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000,  // 1 hour
  },
}));
// if(process.env.NODE_ENV === 'production'){
//   sessionOption.proxy = true;
// }
// app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());



app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

app.use((req, res, next)=> {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error')
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});