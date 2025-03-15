/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 09:35:08
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-04 11:50:36
 * @FilePath: \htmle:\projects_vscode\passenger info search\server.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const cors = require('cors');
const connector = require('./utils/connector');
(async () => {
    await connector.initPool();  // 先初始化连接池
})();

const app = express();

app.use(logger('dev'));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/api/query', async (req, res) => {
    // 查询 "谢天" 的航班数据
    const rows = await connector.query("谢天");
    console.log("🚀 查询完成:", rows);
    res.send(rows);
});

// app.use('./routes/index.js')(app);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        message: err.message || "服务器内部错误"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器启动 监听 ${PORT} 端口号`);
});

process.on("SIGINT", async () => {
    console.log("close");
    connector.close();
    process.exit(0);
});