const oracledb = require('oracledb');

const config = {
    user: "",
    password: "",
    connectString: "",
    poolMin: 2,
    poolMax: 6,
    poolIncrement: 1
}

let pool = null;

class Connector {
    constructor() {
    }

    async initPool() {
        try {
            pool = await oracledb.createPool(config);
            console.log("Oracle 连接池已创建");
        } catch (error) {
            console.error("初始化连接池失败", error);
        }
    }

    async query(sql) {
        let connection = null;
        try {
            connection = await pool.getConnection();
            const result = await connection.execute(sql);
            console.log("查询结果：", result.rows);
        } catch (error) {
            console.error("查询失败", error);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                    console.log("连接已释放");
                } catch (error) {
                    console.error("释放连接失败", error);
                }
            }
        }
    }

    async close() {
        if (pool) {
            try {
                await pool.close();
                console.log("连接池已关闭");
            } catch(error) {
                console.error("关闭连接池失败", error);
            }
        }
    }
}

const connector = new Connector();
connector.initPool();

module.exports = { connector };