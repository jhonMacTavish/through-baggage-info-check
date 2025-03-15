/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 10:22:53
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-06 22:04:06
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

class Connector {
    constructor() {
        this.pool = null;
    }

    async initPool() {
        try {
            this.pool = await oracledb.createPool(config);
            // console.log(this.pool);
            console.log(`✅ 连接池创建成功（状态: ${this.pool._state}）`);
        } catch (error) {
            console.error("❌ 初始化连接池失败", error);
            if (error.errorNum) {
                console.log('Oracle错误代码:', error.errorNum);
                if (error.errorNum === 12154) {
                    console.log('建议检查连接字符串格式：host:port/service_name');
                }
            }
            throw error; // 传播错误以便外部处理
        }
    }

    async query(querys) {
        console.log(querys);
        try {
            // 连接池未初始化
            if (!this.pool) {
                console.error("❌ 连接池未初始化，请先调用 initPool()");
                return null;
            }

            const connection = await this.pool.getConnection();
            console.log("🔗 获取数据库连接成功");

            const sql = `SELECT * FROM TFU_SCIMS.${querys.time == 'week' ? 'TFU_PASSENGERS' : 'TFU_PASSENGERS_HISTORY'} 
                         WHERE ${querys.name ? 'NAME = :name' : ''} 
                         ${querys.flight ? 'AND FLIGHT_NO = :flight' : ''} 
                         ${querys.IDcard ? 'AND ID_CARD = :IDcard' : ''}
                         AND FLIGHT_DATE >= TRUNC(SYSDATE) - ${querys.time == 'week' ? '7' : '30'}`;

            console.log(sql);
            // const binds = querys;
            // const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

            await connection.close();
            console.log("🔌 连接已释放");
            return result.rows;
        } catch (error) {
            console.error("❌ 查询失败", error);
            return null;
        }
    }

    async close() {
        try {
            await this.pool.close();
            console.log("✅ 连接池已关闭");
        } catch (error) {
            console.error("❌ 关闭连接池失败", error);
        }
    }
}

// 不自动执行 initPool()，需要手动调用
const connector = new Connector();
module.exports = connector;
