/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-15 20:25:19
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-27 12:02:23
 * @FilePath: \reconstructione:\projects_vscode\company\passenger-info-search\server\routes\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = app => {
    var express = require('express');
    var router = express.Router();
    var { queryThroughBaggageInfo } = require('../controller/index');

    router.get('/queryThroughBaggageInfo', async (req, res, next) => {
        try {
            // const params = req.query;
            // let querys = {};
            // Object.keys(params).forEach(key => {
            //     if (params[key]) {
            //         // console.log(key, params[key]);
            //         querys[key] = params[key];
            //     }
            // });
            // console.log(querys);
            const rows = await queryThroughBaggageInfo();
            if (!rows || rows.length === 0) {
                return res.json({
                    data: [],
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

    router.get('/queryVerify', async (req, res, next) => {
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
            const rows = await queryVerify(querys);
            if (!rows || rows.length === 0) {
                return res.json({
                    data: [],
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
