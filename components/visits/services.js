const db = require("../../db");
const { ERROR_CODE } = require("../../utility/apiResponse");
const queryBuilder = require("../../utility/queryBuilder");

module.exports = {
    create: async (payload) => {
        try {
            // Insert visit data
            let visitimages = payload?.visitimages;
            delete payload.visitimages;
            const queryObject = await queryBuilder.insert(payload, 'visits');
            const { rows: [insertedVisit] } = await db.buildQuery(queryObject.query, queryObject.values);
            const visitId = insertedVisit.id;
    
            // Insert images if available
            if (visitimages && Array.isArray(visitimages) && visitimages.length > 0) {
                for (const image of visitimages) {
                    const imageInsertQuery = 'INSERT INTO visitimages (visitid, imageurl) VALUES ($1, $2) RETURNING id';
                    await db.buildQuery(imageInsertQuery, [visitId, image]);
                }
            }
    
            return { id: visitId, ...payload };
        } catch (err) {
            console.error(err);
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },

    fetch: async () => {
        try {
            // Step 1: Fetch all visits
            const visitQuery = `
                SELECT 
                    v.id, 
                    v.createdby, 
                    v.visitdate, 
                    v.note, 
                    v.latitude, 
                    v.longitude, 
                    v.status, 
                    v.createdat,
                    v.districtid,
                    v.talukaid,
                    v.villageid,
                    d.name AS district_name, 
                    t.name AS taluka_name, 
                    vil.name AS village_name
                FROM visits v
                LEFT JOIN districts d ON v.districtid = d.id
                LEFT JOIN talukas t ON v.talukaid = t.id
                LEFT JOIN villages vil ON v.villageid = vil.id
                ORDER BY v.id DESC;
            `;
    
            const { rows: visits } = await db.buildQuery(visitQuery);
    
            if (!visits.length) return [];
    
            // Step 2: Get all images at once
            const visitIds = visits.map(v => v.id);
            const imageQuery = `
                SELECT visitid, imageurl 
                FROM visitimages 
                WHERE visitid = ANY($1::int[]);
            `;
            const { rows: imageRows } = await db.buildQuery(imageQuery, [visitIds]);
    
            // Step 3: Group images by visitid
            const imageMap = {};
            for (const row of imageRows) {
                if (!imageMap[row.visitid]) imageMap[row.visitid] = [];
                imageMap[row.visitid].push(row.imageurl);
            }
    
            // Step 4: Attach visitimages to each visit
            const enrichedVisits = visits.map(visit => ({
                ...visit,
                visitimages: imageMap[visit.id] || []
            }));
    
            return enrichedVisits;
    
        } catch (err) {
            console.error(err);
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (payload, id) => {
        try {
            const whereClause = { id }
            const queryObject = await queryBuilder.update(payload, "visits", whereClause)
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
            // Fetch the main visit details
            const query = `
                SELECT 
                    v.id, 
                    v.createdby, 
                    v.visitdate, 
                    v.note, 
                    v.latitude, 
                    v.longitude, 
                    v.status, 
                    v.createdat,
                    v.districtid,
                    v.talukaid,
                    v.villageid,
                    d.name AS district_name, 
                    t.name AS taluka_name, 
                    vil.name AS village_name
                FROM visits v
                LEFT JOIN districts d ON v.districtid = d.id
                LEFT JOIN talukas t ON v.talukaid = t.id
                LEFT JOIN villages vil ON v.villageid = vil.id
                WHERE v.id = $1;
            `;
            const { rows: [visit] } = await db.buildQuery(query, [id]);
    
            if (!visit) return null;
    
            // Fetch related images
            const imageQuery = `SELECT imageurl FROM visitimages WHERE visitid = $1;`;
            const { rows: images } = await db.buildQuery(imageQuery, [id]);
    
            visit.visitimages = images.map(img => img.imageurl); // Add image array
    
            return visit;
        } catch (err) {
            console.error(err);
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },    
   fetchByUserId: async (id) => {
    try {
        // Step 1: Fetch visits created by a specific user
        const visitQuery = `
            SELECT 
                v.id, 
                v.createdby, 
                v.visitdate, 
                v.note, 
                v.latitude, 
                v.longitude, 
                v.status, 
                v.createdat,
                v.districtid,
                v.talukaid,
                v.villageid,
                d.name AS district_name, 
                t.name AS taluka_name, 
                vil.name AS village_name
            FROM visits v
            LEFT JOIN districts d ON v.districtid = d.id
            LEFT JOIN talukas t ON v.talukaid = t.id
            LEFT JOIN villages vil ON v.villageid = vil.id
            WHERE v.createdby = $1
            ORDER BY v.id DESC;
        `;

        const { rows: visits } = await db.buildQuery(visitQuery, [id]);

        if (!visits.length) return [];

        // Step 2: Get all image records for the fetched visits
        const visitIds = visits.map(v => v.id);
        const imageQuery = `
            SELECT visitid, imageurl 
            FROM visitimages 
            WHERE visitid = ANY($1::int[]);
        `;
        const { rows: imageRows } = await db.buildQuery(imageQuery, [visitIds]);

        // Step 3: Group images by visitid
        const imageMap = {};
        for (const row of imageRows) {
            if (!imageMap[row.visitid]) imageMap[row.visitid] = [];
            imageMap[row.visitid].push(row.imageurl);
        }

        // Step 4: Attach visitimages array to each visit object
        const enrichedVisits = visits.map(visit => ({
            ...visit,
            visitimages: imageMap[visit.id] || []
        }));

        return enrichedVisits;

    } catch (err) {
        console.error(err);
        return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
    }
},

    delete: async (id) => {
        try {
            const { rowCount } = await db.buildQuery(`delete from visits where id = $1`, {id});
            return { rowCount };
        } catch (err) {
            return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
    },
    fetchVisitReport: async ({ filterType, createdby }) => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const startOfMonth = `${today.slice(0, 8)}01`;
          let dateFilter = '';
      
          if (filterType === 'today') {
            dateFilter = `AND v.visitdate = '${today}'`;
          } else if (filterType === 'month') {
            dateFilter = `AND v.visitdate >= '${startOfMonth}'`;
          }
      
          const assignmentQuery = `
            SELECT divisionid, districtid, talukaid, villageid
            FROM assignments
            WHERE userid = $1
            LIMIT 1
          `;
          const { rows: [assignment] } = await db.buildQuery(assignmentQuery, [createdby]);
          if (!assignment) return [];
      
          const locationFilter = [];
          if (assignment.villageid) {
            locationFilter.push(`v.villageid = ${assignment.villageid}`);
          } else if (assignment.talukaid) {
            locationFilter.push(`v.talukaid = ${assignment.talukaid}`);
          } else if (assignment.districtid) {
            locationFilter.push(`v.districtid = ${assignment.districtid}`);
          } else if (assignment.divisionid) {
            locationFilter.push(`d.divisionid = ${assignment.divisionid}`);
          }
      
          const whereClause = locationFilter.length ? `WHERE ${locationFilter.join(' AND ')}` : '';
      
          const query = `
            SELECT 
              dv.id AS division_id,
              dv.name AS division_name,
              d.id AS district_id,
              d.name AS district_name,
              t.id AS taluka_id,
              t.name AS taluka_name,
              vlg.id AS village_id,
              vlg.name AS village_name,
              COUNT(v.id) AS visit_count
            FROM divisions dv
            INNER JOIN districts d ON d.divisionid = dv.id
            INNER JOIN talukas t ON t.districtid = d.id
            INNER JOIN villages vlg ON vlg.talukaid = t.id
            LEFT JOIN visits v ON v.villageid = vlg.id ${dateFilter}
            ${whereClause}
            GROUP BY dv.id, dv.name, d.id, d.name, t.id, t.name, vlg.id, vlg.name
            ORDER BY dv.name, d.name, t.name, vlg.name;
          `;
      
          const { rows } = await db.buildQuery(query);
      
          // Transform to UI format
          const divisionMap = {};
      
          for (const row of rows) {
            const {
              division_id,
              division_name,
              district_id,
              district_name,
              taluka_id,
              taluka_name,
              village_id,
              village_name,
              visit_count
            } = row;
      
            if (!divisionMap[division_id]) {
              divisionMap[division_id] = {
                division_id,
                division_name,
                division_visit_count: '0', // Change to string
                districts: []
              };
            }
      
            const division = divisionMap[division_id];
      
            let district = division.districts.find(d => d.district_id === district_id);
            if (!district) {
              district = {
                district_id,
                district_name,
                visit_count: '0', // Change to string
                talukas: []
              };
              division.districts.push(district);
            }
      
            let taluka = district.talukas.find(t => t.taluka_id === taluka_id);
            if (!taluka) {
              taluka = {
                taluka_id,
                taluka_name,
                visit_count: '0', // Change to string
                villages: []
              };
              district.talukas.push(taluka);
            }
      
            taluka.villages.push({
              village_id,
              village_name,
              visit_count: String(visit_count) // Change to string
            });
      
            taluka.visit_count = Number(taluka.visit_count) + Number(visit_count); // Change to string
            district.visit_count =Number(district.visit_count) + Number(visit_count); // Change to string
            division.division_visit_count = String(Number(division.division_visit_count) + Number(visit_count)); // Change to string
          }
      
          return Object.values(divisionMap);
        } catch (err) {
          console.error(err);
          return new Error(ERROR_CODE.INTERNAL_SERVER_ERROR);
        }
      }
           
    
}
