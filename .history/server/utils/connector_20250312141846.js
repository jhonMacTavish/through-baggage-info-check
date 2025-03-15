/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 10:22:53
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-12 12:55:41
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

    async queryPassenger(querys) {
        try {
            if (!this.pool) {
                console.log('initPool');
                await this.initPool();
            }

            const connection = await this.pool.getConnection();
            console.log("🔗 获取数据库连接成功");

            // 校验time参数
            const time = querys.time;
            const tableName = time === '7' ? 'TFU_PASSENGERS' : 'TFU_PASSENGERS_HISTORY';

            // 构建动态条件
            const conditions = [];
            const binds = { time };
            if (querys.name) {
                conditions.push('NAME = :name');
                binds.name = querys.name;
            }
            if (querys.flight) {
                conditions.push('FLIGHT_NO = :flight');
                binds.flight = querys.flight;
            }
            if (querys.IDcard) {
                conditions.push('ID_CARD = :IDcard');
                binds.IDcard = querys.IDcard;
            }
            conditions.push('FLIGHT_DATE >= TRUNC(SYSDATE) - :time');

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const sql = `SELECT * FROM TFU_SCIMS.${tableName} ${whereClause}`;

            console.log('执行SQL:', sql);
            console.log('绑定参数:', binds);

            const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
            await connection.close();
            console.log("🔌 连接已释放");
            return result.rows;
        } catch (error) {
            console.error("❌ 查询失败:", error.message);
            if (error.sql) {
                console.error('SQL:', error.sql);
            }
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
