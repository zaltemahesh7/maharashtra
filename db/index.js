const { Pool } = require("pg");

class DBconn {
    pool = undefined;
    static async init() {
        try {
            this.pool = new Pool({
                host: 'ryes-db.cpc0ic8es0uq.ap-south-1.rds.amazonaws.com',
                user: 'ryes',
                password: 'Ryesdb123',
                // max: 20,
                // idleTimeoutMillis: 30000,
                // connectionTimeoutMillis: 2000,
                database: "maharashtra",
                port: 5432,
                ssl: {
                    rejectUnauthorized: false, // Required for AWS RDS
                },
            })
            const result = await this.pool.query('SELECT \'brianc\' as name')
            console.log(result != null ? "Database initiated successfully" : "") // brianc
        } catch (error) {
            console.log("error", error)
        }
    }

    //             host: 'ryes-db.cpc0ic8es0uq.ap-south-1.rds.amazonaws.com',
    //             user: 'ryes',
    //             password: 'Ryesdb123',
    //             // max: 20,
    //             // idleTimeoutMillis: 30000,
    //             // connectionTimeoutMillis: 2000,
    //             database: "ryes-db",
    //             port: 5432,
    //             ssl: {
    //                 rejectUnauthorized: false, // Required for AWS RDS
    //             },

    static getConnection() {
        if (!this.pool) {
            this.init()
        } else {
            return this.pool
        }
    }

    static buildQuery(query, params = null, tInstance = null) {
        let queryParameters = [];
        let queryInstance;
        if (params) {
            queryParameters = Object.values(params).map(value => value)
        }
        queryInstance = tInstance || this.pool;
        console.log(query, queryParameters)
        return queryInstance.query(query, queryParameters)
    }

    static async initiateTransaction(){
        const transactionClient = await this.pool.connect();
        return transactionClient;
    }
    static async transaction(state, transactionInstance) {
        let transactionId;
        switch (state) {
            case 'start':
                transactionInstance.query("BEGIN")
                transactionId = await client.query('SELECT txid_current()');
                break;
            case 'commit':
                transactionInstance.query("COMMIT")
                break;
            case 'rollback':
                transactionInstance.query("ROLLBACK")
                break;
            default:
                break;
        }
        return transactionId;
    }
}

module.exports = DBconn;
