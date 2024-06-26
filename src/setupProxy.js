const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = (app) => {
    app.use(
        createProxyMiddleware('/api', {
            target: 'http://localhost:5000/', // 노드 서버 주소
            changeOrigin: true
        })
    )
}