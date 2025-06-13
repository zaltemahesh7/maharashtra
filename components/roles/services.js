const db = require("../../db");
const { ERROR_CODE } = require("../../utility/constants");
const queryBuilder = require("../../utility/queryBuilder");

module.exports = {
     create: async (payload) => {
        try {
            const queryObject = await queryBuilder.insert(payload, 'roles');
            const { rows: [insertedId] } = await db.buildQuery(queryObject.query, queryObject.values);
            const result = {
                id: insertedId.id,
                ...payload
            };
    
            return result;
        } catch (err) {
            console.error(err);
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
    fetch: async () => {
        try {
            const { rows } = await db.buildQuery(`select * from roles where isactive = true`)
            return rows;
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR)
        }
    },
    update: async (payload, id) => {
        try {
            const whereClause = { id }
            const queryObject = await queryBuilder.update(payload, "roles", whereClause)
            const { rowCount } = await db.buildQuery(queryObject.query, queryObject.values)
            return {
                ...payload, updatedCount: rowCount
            }
        } catch (err) {
            if(err.code == 23505) {
                return new Error(ERROR_CODE.DUPLICATE_RECOORD)
            }
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR)
        }
    },
   fetchById: async (id) => {
        try {
            const { rows: [tenant] } = await db.buildQuery(`select * from roles where id = $1`, {id});
            return tenant;
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
    delete: async (id) => {
        try {
            const { rowCount } = await db.buildQuery(`delete from roles where id = $1`, {id});
            return { rowCount };
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
}
