/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 09:35:08
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-06 21:53:28
 * @FilePath: \htmle:\projects_vscode\passenger info search\server.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const cors = require('cors');
const axios = require('axios');
const md5 = require('js-md5');
const connector = require('./utils/connector');

const app = express();

app.use(logger('dev'));
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

app.get('/api/adminUser/profile', async (req, res) => {
    const userInfo = await axios.get('http://backend-api-02.newbee.ltd/manage-api/v1/adminUser/profile');
    console.log(userInfo.data);
});

app.post('/api/adminUser/login', async (req, res) => {
    try {
        const { userName, passwordMd5 } = req.body;
        
        // 统一使用 async/await 语法
        const response = await axios.post('http://backend-api-02.newbee.ltd/manage-api/v1/adminUser/login', {
            userName,
            passwordMd5: md5(passwordMd5) // 确认是否需要双重MD5哈希
        });

        console.log(response.data);
        // 发送响应后立即返回
        return res.json({ 
            data: response.data 
        });
    } catch (error) {
        // 错误处理
        console.error('登录失败:', error.message);
        return res.status(500).json({
            status: 'ERROR',
            message: '登录失败，请检查用户名或密码'
        });
    }
});

app.delete('/api/logout', async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.params);
        await axios.delete('http://backend-api-02.newbee.ltd/manage-api/v1/logout').then((Ares) => {
            // 退出之后，将本地保存的 token  清理掉
            console.log(Ares.data);
            res.json({
                data: Ares.data
            });
        });
    } catch (error) {

    }
});

app.get('/api/query', async (req, res, next) => {
    try {
        const params = req.query;
        let query = {};
        Object.keys(params).forEach(key => {
            if(params[key]){
                console.log(key, params[key]);
                query.key = params[key];
            }
        });
        console.log(query);
        // const rows = await connector.query("谢天");
        // if (!rows || rows.length === 0) {
        //     return res.status(404).json({
        //         message: `未找到的相关记录`
        //     });
        // }

        res.json({
            data: params
        });
    } catch (error) {
        console.error(`🚨 查询错误: ${error.message}`);
        next(error);
    }
});

// app.use('./routes/index.js')(app);

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
        // await connector.initPool();  // 先初始化连接池

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