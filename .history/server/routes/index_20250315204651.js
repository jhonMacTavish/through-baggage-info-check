module.exports = app => {
    var express = require('express');
    var router = express.Router();
    var { queryPassenger, queryVerify } = require('../controller/index');

    router.get('/queryPassenger', async (req, res, next) => {
        try {
            const params = req.query;
            let querys = {};
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    // console.log(key, params[key]);
                    querys[key] = params[key];
                }
            });
            console.log(querys);
            const rows = await queryPassenger(querys);
            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    message: `未找到的相关记录`
                });
            }

            res.send({
                data: rows
            });
        } catch (error) {
            console.error(`🚨 查询错误: ${error.message}`);
            next(error);
        }
    });

    app.use('/api', router);
}
