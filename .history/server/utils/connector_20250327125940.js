/*
 * @Author: john_mactavish 981192661@qq.com
 * @Date: 2025-03-04 10:22:53
 * @LastEditors: john_mactavish 981192661@qq.com
 * @LastEditTime: 2025-03-27 12:59:39
 * @FilePath: \htmle:\projects_vscode\passenger info search\utils\connector.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const oracledb = require('oracledb');

const config = {
    user: "fuif",
    password: "Qazxsw@123",
    connectString: "10.33.160.3:1521/CKCIDB",
    // privilege: oracledb.SYSDBA,
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