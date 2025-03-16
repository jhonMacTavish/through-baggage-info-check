var connector = require('../utils/connector');

const queryPassenger = async (querys) => {

    try {
        return await connector.executeQuery(() => {
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
};

async function queryVerify(querys) {
    try {
        return await connector.executeQuery(() => {
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

module.exports = { queryPassenger, queryVerify };