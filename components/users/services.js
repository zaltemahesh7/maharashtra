const db = require("../../db");
const { ERROR_CODE } = require("../../utility/constants");
const queryBuilder = require("../../utility/queryBuilder");

module.exports = {
  
    create: async (payload) => {
        try {
            // Step 1: Separate user and assignment fields
            const {
                divisionid,
                roleid,
                districtid,
                talukaid,
                villageid,
                ...userPayload
            } = payload;

            let userPayloadData = {
                roleid: roleid,
                ...userPayload
            }
            // Step 2: Insert into users table
            const userInsertQuery = await queryBuilder.insert(userPayloadData, 'users');
            const { rows: [insertedUser] } = await db.buildQuery(userInsertQuery.query, userInsertQuery.values);
    
            const result = {
                id: insertedUser.id,
                ...userPayload
            };
    
            // Step 3: Insert into assignments table (only if roleid exists)
            if (roleid) {
                const assignmentPayload = {
                    userid: insertedUser.id,
                    roleid,
                    districtid: +districtid || null,
                    talukaid: +talukaid || null,
                    villageid: +villageid || null,
                    divisionid: +divisionid || null
                };
    
                const assignmentQuery = await queryBuilder.insert(assignmentPayload, 'assignments');
                await db.buildQuery(assignmentQuery.query, assignmentQuery.values);
            }
    
            return result;
    
        } catch (err) {
            console.error('Error creating user:', err);
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
    createUserWithoutAssignment: async (payload) => {
        try {
           
            // Step 2: Insert into users table
            const userInsertQuery = await queryBuilder.insert(payload, 'users');
            const { rows: [insertedUser] } = await db.buildQuery(userInsertQuery.query, userInsertQuery.values);
    
            const result = {
                id: insertedUser.id,
            };
    
            return result;
    
        } catch (err) {
            console.error('Error creating user:', err);
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
        
    fetch: async () => {
        try {
            const { rows } = await db.buildQuery(`
                SELECT 
                    u.id AS userId,
                    u.username AS userName,
                    u.mobile AS mobileno,
                    a.id AS assignmentId,
                    r.id AS roleId,
                    r.name AS roleName,
                    CASE WHEN r.id = 1 THEN 'All' ELSE d.name END AS districtName,
                    CASE WHEN r.id = 1 THEN 'All' ELSE div.name END AS divisionName,
                    CASE WHEN r.id = 1 THEN 'All' ELSE t.name END AS talukaName,
                    CASE WHEN r.id = 1 THEN 'All' ELSE v.name END AS villageName,
                    d.id AS districtId,
                    div.id AS divisionId,
                    t.id AS talukaId,
                    v.id AS villageId
                FROM users u 
                LEFT JOIN assignments a ON a.userid = u.id
                LEFT JOIN roles r ON r.id = a.roleid
                LEFT JOIN divisions div ON div.id = a.divisionid
                LEFT JOIN districts d ON d.id = a.districtid
                LEFT JOIN talukas t ON t.id = a.talukaid
                LEFT JOIN villages v ON v.id = a.villageid
                WHERE r.id IS NOT NULL AND r.id <> 1;
            `);
            return rows;
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
    
    update: async (payload, id) => {
        try {
            const whereClause = { id }
            const queryObject = await queryBuilder.update(payload, "users", whereClause)
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
            const { rows: [tenant] } = await db.buildQuery(`select * from users where id = $1`, {id});
            return tenant;
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
    delete: async (id) => {
        try {
             // Delete assignments linked to the user
            await db.buildQuery(`DELETE FROM assignments WHERE userid = $1`, [id]);

            const { rowCount } = await db.buildQuery(`delete from users where id = $1`, {id});
            return { rowCount };
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },

    fetchByRoleId: async (id) => {
        try {
            const { rows } = await db.buildQuery(`select * from users where roleid = $1`, {id});
            return rows;
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },

    getAssignedUsers: async ({ roleid, districtid = null, talukaid = null, villageid = null }) => {
        try {
            // 1. Define child role id
            const roleHierarchy = {
            //Secretary
            2: 3, // Secretary -> Collector
            2: 4, // Secretary => Additional Collector
            2: 5, // Secretary => Additional Collector

            //divisional commisioner
            3: 4, // divisional commisioner -> collector
            3: 5, // divisional commisioner -> Additional Collector

            // Collector
            4: 6, // Collector -> SDO - Prantadhikari
            4: 7, // Collector -> Tehsildar

            // Additional Collector 
            5: 6, // Additional Collector -> SDO - Prantadhikari
            5: 7, // Additional Collector -> Tehsildar

            // SDO
            6: 7, // SDO => tahsildar
            //Tehsildar
            7: 8, // Tehsildar -> Talathi
        };
    
            const childRoleId = roleHierarchy[roleid];
            if (!childRoleId) {
                return []; // No child role
            }
    
            // 2. Build WHERE clause dynamically
            const whereConditions = ['a.roleid = $1'];
            const values = [childRoleId];
            let index = 2;
    
            if (districtid) {
                whereConditions.push(`a.districtid = $${index++}`);
                values.push(districtid);
            }
            if (talukaid) {
                whereConditions.push(`a.talukaid = $${index++}`);
                values.push(talukaid);
            }
            if (villageid) {
                whereConditions.push(`a.villageid = $${index++}`);
                values.push(villageid);
            }
    
            const query = `
                SELECT 
                    u.id AS userid,
                    u.username,
                    r.name AS role,
                    d.name AS district_name,
                    t.name AS taluka_name,
                    v.name AS village_name
                FROM 
                    users u
                JOIN assignments a ON a.userid = u.id
                JOIN roles r ON r.id = a.roleid
                LEFT JOIN districts d ON d.id = a.districtid
                LEFT JOIN talukas t ON t.id = a.talukaid
                LEFT JOIN villages v ON v.id = a.villageid
                WHERE ${whereConditions.join(' AND ')}
            `;
    
            const { rows } = await db.buildQuery(query, values);
            return rows;
        } catch (err) {
            console.error('Error in getAssignedUsers:', err);
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
    getUserWiseReport: async ({userid, roleid, districtid = null, talukaid = null, villageid = null }) => {
    try {
        const roleHierarchy = {
            //Secretary
            2: 3, // Secretary -> Collector
            2: 4, // Secretary => Additional Collector
            2: 5, // Secretary => Additional Collector

            //divisional commisioner
            3: 4, // divisional commisioner -> collector
            3: 5, // divisional commisioner -> Additional Collector

            // Collector
            4: 6, // Collector -> SDO - Prantadhikari
            4: 7, // Collector -> Tehsildar

            // Additional Collector 
            5: 6, // Additional Collector -> SDO - Prantadhikari
            5: 7, // Additional Collector -> Tehsildar

            // SDO
            6: 7, // SDO => tahsildar
            //Tehsildar
            7: 8, // Tehsildar -> Talathi
        };

        const childRoleId = roleHierarchy[roleid];
        if (!childRoleId) return [];

        const whereConditions = ['a.roleid = $1'];
        const values = [childRoleId];
        let index = 2;

        if (districtid) {
            whereConditions.push(`a.districtid = $${index++}`);
            values.push(districtid);
        }
        if (talukaid) {
            whereConditions.push(`a.talukaid = $${index++}`);
            values.push(talukaid);
        }
        if (villageid) {
            whereConditions.push(`a.villageid = $${index++}`);
            values.push(villageid);
        }

        // Add user ID condition correctly
        // whereConditions.push(`u.id = $${index}`);
        // values.push(userid);

        const query = `
            SELECT 
                u.id AS userid,
                u.username,
                r.name AS role,
                d.name AS district_name,
                t.name AS taluka_name,
                v.name AS village_name,
                COALESCE(vs.total_visits, 0) AS total_visits,
                COALESCE(vs.pending_visits, 0) AS pending_visits,
                COALESCE(vs.completed_visits, 0) AS completed_visits
            FROM 
                users u
            JOIN assignments a ON a.userid = u.id
            JOIN roles r ON r.id = a.roleid
            LEFT JOIN districts d ON d.id = a.districtid
            LEFT JOIN talukas t ON t.id = a.talukaid
            LEFT JOIN villages v ON v.id = a.villageid
            LEFT JOIN (
                SELECT 
                    createdby,
                    COUNT(*) AS total_visits,
                    COUNT(*) FILTER (WHERE status = 'pending') AS pending_visits,
                    COUNT(*) FILTER (WHERE status = 'completed') AS completed_visits
                FROM visits
                GROUP BY createdby
            ) vs ON vs.createdby = u.id
            WHERE ${whereConditions.join(' AND ')}
        `;

        const { rows } = await db.buildQuery(query, values);
        return rows;
    } catch (err) {
        console.error('Error in getAssignedUsers:', err);
        return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
    }
 
}
