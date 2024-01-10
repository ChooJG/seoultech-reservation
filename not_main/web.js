const express = require('express');
const path = require('path');
const web = express();
const port = process.env.PORT || 3000; // 포트는 환경 변수로 설정하거나 없다면 3000으로 설정

web.use(express.static(path.join(__dirname, 'public'))); // public 폴더를 정적 폴더로 설정

web.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'start.html')); // start.html 파일을 서비스
});

web.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
