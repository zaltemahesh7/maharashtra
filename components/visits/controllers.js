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
    fetchByUserId: async (req, res)=> {
        const resp = await service.fetchByUserId(req.params.userid);
        res.status(200).send(resp)
    },
    fetchVisitReport: async (req, res) => {
        try {
            const { filterType, createdby } = req.query;
    
            // Validate filterType
            if (!['today', 'month'].includes(filterType)) {
                return res.status(400).send({ message: 'Invalid filterType. Use "today" or "month".' });
            }
    
            const report = await service.fetchVisitReport({ filterType, createdby });
    
            res.status(200).send(report);
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Internal server error' });
        }
    },    
    delete: async (req, res)=> {
        const resp = await service.delete(req.params.id);
        res.status(200).send(resp)
    }, 
}
