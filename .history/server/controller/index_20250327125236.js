var connector = require('../utils/connector');

const queryThroughBaggageInfo = async () => {
    try {
        return await connector.executeQuery(() => {
            const flightList = [
                '3U3816', '3U3828', '3U3838', '3U3860', '3U3886', '3U3888', '3U3892', '3U3896',
                '3U3902', '3U3904', '3U3936', '3U3938', '3U9605', 'CA412', 'CA414', 'CA432', 'CA446',
                'CA466', '3U3863', '3U3865', '3U6876', '3U6880', 'CA4508', 'CA4510', 'CA4514', 'CA4592',
                'CA8541'
            ];
            const placeholder = flightList.map((_, i) => `:${i + 1}`).join(',');

            const sql = `SELECT
                f.FLIGHT_NO_FULL AS 航班号,
                f."ATTRIBUTE" AS 属性,
                f.TIME_START_PLAN AS 计划起飞时间,
                f.TIME_TERMINAL_PLAN AS 计划到港时间,
                f.AIRPORT_START AS 始发地,
                pi.旅客人数,
                pi.行李件数
            FROM
                TFU_INT_SCIMS.TFU_F_FLIGHT f
            LEFT JOIN (
                SELECT
                    PI.FLIGHT_NO,
                    PI.TIMESTARTPLAN,
                    COUNT(*) AS 旅客人数,
                    SUM(PI.PIECE) AS 行李件数
                FROM
                    TFU_INT_SCIMS.PASSENGER_INFO PI
                    LEFT JOIN BAG_LISTAGG_ALL BLA ON BLA.PASSENGER_ID = PI.PASSENGER_ID
                WHERE
                    PI.TIMESTARTPLAN >= SYSDATE - INTERVAL '1' DAY
                    AND (BLA.ARRIVAL IS NULL OR BLA.ARRIVAL NOT LIKE '%TFU%')
                    AND PI.OUT_BNNUM IS NOT NULL
                    AND PI.OUT_FLIGHT_SEATNO IS NOT NULL
                GROUP BY
                    PI.FLIGHT_NO,
                    PI.TIMESTARTPLAN
            ) pi ON f.FLIGHT_NO_FULL = pi.FLIGHT_NO AND f.TIME_START_PLAN = pi.TIMESTARTPLAN
            WHERE
                f.FLIGHT_DATE >= TRUNC(SYSDATE)
                AND f.inout = 'A'
                AND f.FLIGHT_NO_FULL IN (${placeholder})
            ORDER BY
                f."ATTRIBUTE",
                f.TIME_START_PLAN`;
            const binds = {};
            flightList.forEach((flight, index) => {
                binds[index + 1] = flight;
            });

            return { sql, binds };
        });
    } catch (error) {
        console.error("❌ 乘客查询失败:", error.message);
        if (error.sql) console.error('SQL:', error.sql);
        return null;
    }
};

module.exports = { queryThroughBaggageInfo };