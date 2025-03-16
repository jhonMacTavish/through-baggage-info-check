/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 09:35:08
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-15 20:57:19
 * @FilePath: \htmle:\projects_vscode\passenger info search\server.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');
const FileStreamRotator = require('file-stream-rotator');
const fs = require('fs');
var path = require('path');
const createError = require('http-errors');
const logger = require('morgan');
const cors = require('cors');
const axios = require('axios');
const md5 = require('js-md5');
const connector = require('./utils/connector');

const app = express();
var logDirectory = path.join(__dirname, 'log');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    max_logs: '7d',
    utc: false, 
    verbose: false
});

app.use(logger('common', {stream: accessLogStream}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        db: connector.pool ? 'connected' : 'disconnected'
    });
});

require('./routes/index.js')(app);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        error: {
            message: err.message || "服务器内部错误",
        }
    });
});

async function startServer() {
    try {
        await connector.initPool();  // 先初始化连接池

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`服务器启动 监听 ${PORT} 端口号`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

async function gracefulShutdown() {
    console.log('\n🛑 收到关闭信号，开始清理...');
    try {
        await connector.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ 关闭失败:', error);
        process.exit(1);
    }
}

process.on("SIGINT", gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();