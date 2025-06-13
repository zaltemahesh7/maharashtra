const bcrypt = require("bcrypt");

module.exports = {
    insert: async (payload, table) => {
        if (!payload || Object.keys(payload).length === 0) {
            throw new Error("Payload cannot be empty");
        }

        // Encrypt the passwordhash key if it exists in the payload
        // if (payload.passwordhash && typeof payload.passwordhash === "string") {
        //     const saltRounds = 10;
        //     payload.passwordhash = await bcrypt.hash(payload.passwordhash, saltRounds);
        // }

        const keys = Object.keys(payload);
        const values = Object.values(payload);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

        const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;

        return {
            query: query,
            values: values
        };
    },

    update: async (payload, table, whereClause) => {
        if (!payload || Object.keys(payload).length === 0) {
            throw new Error("Payload cannot be empty");
        }

        let query = `UPDATE ${table} SET `;
        const keys = [];
        const values = [];
        const whereKeys = [];
        let lastIndex = 0;

        // Encrypt passwordhash if it exists
        if (payload.passwordhash && typeof payload.passwordhash === "string") {
            const saltRounds = 10;
            payload.passwordhash = await bcrypt.hash(payload.passwordhash, saltRounds);
        }

        // Create query string for updates
        Object.keys(payload).forEach((key, index) => {
            lastIndex = index + 1;
            keys.push(`${key}=$${lastIndex}`);
            values.push(payload[key]);
        });

        if (whereClause) {
            Object.keys(whereClause).forEach((key, index) => {
                lastIndex += 1;
                whereKeys.push(`${key}=$${lastIndex}`);
                values.push(whereClause[key]);
            });
        }

        return {
            query: query.concat(keys.join(', ')).concat(" WHERE ").concat(whereKeys.join(" AND ")),
            values,
        };
    },
};
