/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 10:22:53
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-15 21:06:53
 * @FilePath: \htmle:\projects_vscode\passenger info search\utils\connector.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const oracledb = require('oracledb');

const config = {
    user: "sys",
    password: "TFdbadmin123",
    connectString: "10.33.249.1:1521/ORCLSCCDBZB",
    privilege: oracledb.SYSDBA,
    poolMin: 2,
    poolMax: 6,
    poolIncrement: 1
};

class Connector {
    constructor() {
        this.pool = null;
        this.initializing = null;
    }

    async ensurePoolInitialized() {
        if (!this.pool) {
            if (!this.initializing) {
                this.initializing = this.initPool();
            }
            await this.initializing;
        }
    }

    async initPool() {
        try {
            this.pool = await oracledb.createPool(config);
            console.log(`✅ 连接池创建成功（状态: ${this.pool._state}）`);
            return this.pool;
        } catch (error) {
            console.error("❌ 初始化连接池失败", error);
            if (error.errorNum === 12154) {
                console.log('建议检查连接字符串格式：host:port/service_name');
            }
            throw error;
        }
    }

    async executeQuery(queryBuilder) {
        // await this.ensurePoolInitialized();
        const connection = await this.pool.getConnection();
        
        try {
            const { sql, binds } = queryBuilder();
            console.log('执行SQL:', sql, '绑定参数:', binds);
            
            const result = await connection.execute(sql, binds, { 
                outFormat: oracledb.OUT_FORMAT_OBJECT 
            });
            return result.rows;
        } finally {
            await connection.close();
            console.log("🔌 连接已释放");
        }
    }

    async queryPassenger(querys) {
        try {
            return await this.executeQuery(() => {
                const time = parseInt(querys.time, 10) || 7;
                const tableName = time === 7 ? 'TFU_PASSENGERS' : 'TFU_PASSENGERS_HISTORY';
                
                const conditions = ['FLIGHT_DATE >= TRUNC(SYSDATE) - :time'];
                const binds = { time };
                
                // 使用白名单校验字段
                const validFields = ['name', 'flight', 'IDcard'];
                validFields.forEach(field => {
                    if (querys[field]) {
                        conditions.push(`${field.toUpperCase()} = :${field}`);
                        binds[field] = querys[field];
                    }
                });

                const whereClause = conditions.join(' AND ');
                const sql = `SELECT * FROM TFU_SCIMS.${tableName} WHERE ${whereClause}`;

                return { sql, binds };
            });
        } catch (error) {
            console.error("❌ 乘客查询失败:", error.message);
            if (error.sql) console.error('SQL:', error.sql);
            return null;
        }
    }

    async queryVerify(querys) {
        try {
            return await this.executeQuery(() => {
                const time = parseInt(querys.time, 10) || 7;
                const verTable = time <= 7 ? 'TFU_PASS_VERIFICATIONS' : 'TFU_PASS_VERIFICATIONS_HISTORY';
                const boardTable = time <= 7 ? 'TFU_PASS_BOARDS' : 'TFU_PASS_BOARDS_HISTORY';
                
                const conditions = [];
                const binds = {};
                
                if (querys.PASSENGER_ID) {
                    conditions.push(`${verTable}.PASSENGER_ID = :passenger_id`);
                    binds.passenger_id = querys.PASSENGER_ID;
                }

                const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
                const sql = `SELECT * FROM TFU_SCIMS.${verTable} `
                    + `LEFT JOIN TFU_SCIMS.${boardTable} `
                    + `ON ${verTable}.PASSENGER_ID = ${boardTable}.PASSENGER_ID ${whereClause}`;

                return { sql, binds };
            });
        } catch (error) {
            console.error("❌ 核验查询失败:", error.message);
            if (error.sql) console.error('SQL:', error.sql);
            return null;
        }
    }

    async close() {
        if (this.pool) {
            try {
                await this.pool.close();
                console.log("✅ 连接池已关闭");
            } catch (error) {
                console.error("❌ 关闭连接池失败", error);
            }
        }
    }
}

const connector = new Connector();
module.exports = connector;