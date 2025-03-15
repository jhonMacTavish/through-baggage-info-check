/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 10:22:53
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-06 09:25:37
 * @FilePath: \htmle:\projects_vscode\passenger info search\utils\connector.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const oracledb = require('oracledb');

const config = {
    user: "sys",
    password: "TFdbadmin123",
    connectString: "10.33.249.1:1521/ORCLSCCDBZB",
    privilege: oracledb.SYSDBA,  // 确保 SYS 账号可以使用
    poolMin: 2,
    poolMax: 6,
    poolIncrement: 1
};

let pool = null;

class Connector {
    constructor() { }

    async initPool() {
        try {
            pool = await oracledb.createPool(config);
            // console.log(pool);
            console.log("✅ Oracle 连接池已创建");
        } catch (error) {
            console.error("❌ 初始化连接池失败", error);
        }
    }

    async query(name) {
        console.log("🔍 开始查询...");
        let connection = null;

        // 连接池未初始化
        if (!pool) {
            console.error("❌ 连接池未初始化，请先调用 initPool()");
            return null;
        }

        try {
            connection = await pool.getConnection();
            console.log("🔗 获取数据库连接成功");

            const sql = `SELECT * FROM TFU_SCIMS.TFU_PASSENGERS_HISTORY 
                         WHERE NAME = :name 
                         AND FLIGHT_DATE >= TRUNC(SYSDATE) - 30`;

            const binds = { name };
            const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

            console.log("✅ 查询结果：", result.rows);
            return result.rows;
        } catch (error) {
            console.error("❌ 查询失败", error);
            return null;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                    console.log("🔌 连接已释放");
                } catch (error) {
                    console.error("❌ 释放连接失败", error);
                }
            }
        }
    }

    async close() {
        console.log("close");
        try {
            await pool.close();
            console.log("✅ 连接池已关闭");
        } catch (error) {
            console.error("❌ 关闭连接池失败", error);
        }
    }
}

// 不自动执行 initPool()，需要手动调用
const connector = new Connector();
module.exports = connector;
