const { send } = require("../../utility/apiResponse");
const service = require("./services");

module.exports = {
    create: async (req, res)=> {
        // console.log(req.body)
        const resp = await service.create(req.body);
        res.status(200).send(resp)
    },
    fetch: async (req, res)=> {
        const resp = await service.fetch();
        res.status(200).send(resp)
    },
    update: async (req, res)=> {
        const resp = await service.update(req.body, req.params.id);
        send(resp, res);
    }, 
    fetchById: async (req, res)=> {
        const resp = await service.fetchById(req.params.id);
        res.status(200).send(resp)
    },
     create: async (req, res)=> {
        // console.log(req.body)
        const resp = await service.create(req.body);
        res.status(200).send(resp)
    },
    createUserWithoutAssignment: async (req, res)=> {
        // console.log(req.body)
        const resp = await service.createUserWithoutAssignment(req.body);
        res.status(200).send(resp)
    },
    delete: async (req, res)=> {
        const resp = await service.delete(req.params.id);
        res.status(200).send(resp)
    },
    fetchByRoleId: async (req, res)=> {
        const resp = await service.fetchByRoleId(req.params.id);
        res.status(200).send(resp)
    }, 
    getAssignedUsers: async (req, res) => {
        try {
            const { roleid } = req.params;
            const { districtid, talukaid, villageid } = req.query; // pass optional filters
    
            const payload = {
                roleid: parseInt(roleid),
                districtid: districtid ? parseInt(districtid) : null,
                talukaid: talukaid ? parseInt(talukaid) : null,
                villageid: villageid ? parseInt(villageid) : null
            };
    
            const resp = await service.getAssignedUsers(payload);
            res.status(200).send(resp);
        } catch (err) {
            console.error("Error in fetchByRoleId:", err);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    },

     getUserWiseReport: async (req, res) => {
        try {
            const { roleid } = req.params;
            const { districtid, talukaid, villageid } = req.query; // pass optional filters
    
            const payload = {
                // userid: parseInt(userid),
                roleid: parseInt(roleid),
                districtid: districtid ? parseInt(districtid) : null,
                talukaid: talukaid ? parseInt(talukaid) : null,
                villageid: villageid ? parseInt(villageid) : null
            };
    
            const resp = await service.getUserWiseReport(payload);
            res.status(200).send(resp);
        } catch (err) {
            console.error("Error in fetchByRoleId:", err);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    
}
