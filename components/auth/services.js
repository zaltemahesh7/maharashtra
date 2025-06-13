const { encryptPassword } = require("../../utility/crypto/index");
const db = require("../../db");
const queryBuilder = require("../../utility/queryBuilder");
const jwt = require("../../utility/jwt");
const { ERROR_CODE } = require("../../utility/constants");
const { send } = require("../../utility/apiResponse");
const bcrypt = require("bcrypt");

module.exports = {
    signup: async (req, res) => {
        try {
            const payload = req.body;

            if (!payload || Object.keys(payload).length === 0) {
                return send(new Error("Payload cannot be empty"), res);
            }

            payload.password = encryptPassword(payload.password);
            let table = "users";
            const queryObject = queryBuilder.insert(payload, table);

            console.log(queryObject);

            const { rows } = await db.buildQuery(queryObject.query, queryObject.values);
            const insertedId = rows[0] || {}; // Ensure we don't get undefined

            return send({ ...payload, ...insertedId }, res);
        } catch (err) {
            console.error("Signup Error:", err);
            return send(new Error(ERROR_CODE.INTERNAL_SERVER_ERROR), res);
        }
    },

    signin: async (req, res) => {
        try {
            let { mobile, password } = req;
    
            if (!mobile || !password) {
                return send(new Error("Mobile and password are required"), res);
            }
    
            mobile = mobile.toLowerCase();
    
            // Fetch user from database
            const query = `
                SELECT u.*, r.name as rolename, a.districtid, a.talukaid, a.villageid, a.divisionid
                FROM users u 
                JOIN roles r ON r.id = u.roleid 
                LEFT JOIN assignments a ON a.userid = u.id 
                WHERE u.username ILIKE $1
            `;
            const { rowCount, rows } = await db.buildQuery(query, [mobile]);
    
            if (!rowCount) {
                return send(new Error(ERROR_CODE.AUTHENTICATION_ERROR || "Authentication Failed"), res);
            }
    
            const user = rows[0];
    
            // Compare hashed password
            let isPasswordValid;
            if(password == user.passwordhash) {
                isPasswordValid = true;
            } else {
                isPasswordValid = false;
            }
            if (!isPasswordValid) {
                return send(new Error(ERROR_CODE.AUTHENTICATION_ERROR || "Authentication Failed"), res);
            }
    
            // Extract assignment fields for token
            const tokenPayload = {
                id: user.id,
                roleid: user.roleid,
                rolename: user.rolename,
                districtid: user.districtid || null,
                talukaid: user.talukaid || null,
                villageid: user.villageid || null,
                divisionid: user.divisionid ||  null,
                username: user.username,
            };
    
            // Generate JWT token with assignment info
            const token = jwt.generateToken(tokenPayload);
    
            return{
                token,
                user: tokenPayload
            };
    
        } catch (error) {
            console.error("Signin Error:", error);
            return send(new Error("Internal Server Error"), res);
        }
    }
    
};
